import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import pg from "pg";
import { z } from "zod";

if (process.env.EVENT_SUPABASE_PROJECT_REF) {
  throw new Error(
    "Apply the tracked Supabase migration to the selected project using Supabase tools",
  );
}

const configSchema = z.object({
  EVENT_APP_ENV: z.enum(["local", "development", "production"]),
  EVENT_DATABASE_URL: z.url(),
  EVENT_DATABASE_ADMIN_URL: z.url(),
  EVENT_DATABASE_SSL: z.enum(["disable", "verify-full"]).default("verify-full"),
  EVENT_DATABASE_CA: z.string().optional(),
});
const config = configSchema.parse(process.env);
const appUrl = new URL(config.EVENT_DATABASE_URL);
const adminUrl = new URL(config.EVENT_DATABASE_ADMIN_URL);
const database = decodeURIComponent(appUrl.pathname.slice(1));
const appRole = decodeURIComponent(appUrl.username);
const expectedDatabase =
  config.EVENT_APP_ENV === "production" ? "hometogether_event_1" : "hometogether_event_1_dev";
const marker = `hometogether:event_1:${config.EVENT_APP_ENV}`;
if (
  !["postgres:", "postgresql:"].includes(appUrl.protocol) ||
  !["postgres:", "postgresql:"].includes(adminUrl.protocol) ||
  database !== expectedDatabase ||
  appRole !== `${database}_app` ||
  appUrl.host !== adminUrl.host ||
  appUrl.username === adminUrl.username
)
  throw new Error("Event database and dedicated role configuration must match");

function connection(url, name) {
  return new pg.Client({
    host: url.hostname,
    port: Number(url.port || 5432),
    database: name,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    ssl:
      config.EVENT_DATABASE_SSL === "verify-full"
        ? { rejectUnauthorized: true, ca: config.EVENT_DATABASE_CA }
        : false,
    connectionTimeoutMillis: 5000,
    statement_timeout: 10000,
    application_name: "event-1-provision",
  });
}

const admin = connection(adminUrl, decodeURIComponent(adminUrl.pathname.slice(1)));
const dbName = pg.escapeIdentifier(database);
const roleName = pg.escapeIdentifier(appRole);
const quoteMarker = pg.escapeLiteral(marker);
const target = connection(adminUrl, database);
try {
  await admin.connect();
  await admin.query("SELECT pg_advisory_lock(hashtext($1))", [marker]);
  const role = await admin.query(
    `SELECT oid, rolsuper, rolcreatedb, rolcreaterole, rolreplication,
       shobj_description(oid, 'pg_authid') AS marker
     FROM pg_roles WHERE rolname = $1`,
    [appRole],
  );
  if (role.rows[0]) {
    const current = role.rows[0];
    if (
      current.marker !== marker ||
      current.rolsuper ||
      current.rolcreatedb ||
      current.rolcreaterole ||
      current.rolreplication
    ) {
      throw new Error("Existing database role is not owned by this event setup");
    }
    const membership = await admin.query("SELECT 1 FROM pg_auth_members WHERE member = $1", [
      current.oid,
    ]);
    if (membership.rowCount) throw new Error("Event role has unexpected memberships");
  } else {
    await admin.query("BEGIN");
    try {
      await admin.query(`CREATE ROLE ${roleName} LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE
        NOINHERIT NOREPLICATION CONNECTION LIMIT 5 PASSWORD ${pg.escapeLiteral(decodeURIComponent(appUrl.password))}`);
      await admin.query(`COMMENT ON ROLE ${roleName} IS ${quoteMarker}`);
      await admin.query("COMMIT");
    } catch (error) {
      await admin.query("ROLLBACK");
      throw error;
    }
  }

  const existing = await admin.query(
    "SELECT shobj_description(oid, 'pg_database') AS marker FROM pg_database WHERE datname = $1",
    [database],
  );
  if (existing.rows[0] && existing.rows[0].marker !== marker) {
    throw new Error("Existing database is not owned by this event setup");
  }
  if (!existing.rows[0]) {
    await admin.query(`CREATE DATABASE ${dbName} TEMPLATE template0 ENCODING 'UTF8'`);
    await admin.query(`COMMENT ON DATABASE ${dbName} IS ${quoteMarker}`);
  }
  await admin.query(`REVOKE ALL ON DATABASE ${dbName} FROM PUBLIC`);
  await admin.query(`GRANT CONNECT ON DATABASE ${dbName} TO ${roleName}`);

  await target.connect();
  await target.query("BEGIN");
  try {
    await target.query("SELECT pg_advisory_xact_lock(hashtext($1))", [marker]);
    await target.query(`CREATE TABLE IF NOT EXISTS event_migrations (
      version text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now()
    )`);
    const migrationDirectory = new URL("../supabase/migrations/", import.meta.url);
    const migrationFiles = (await readdir(migrationDirectory))
      .filter((name) => name.endsWith(".sql"))
      .sort();
    const migrations = [
      { version: "001-intake", file: new URL("../db/001-intake.sql", import.meta.url) },
      ...migrationFiles.map((name) => ({ version: name, file: new URL(name, migrationDirectory) })),
    ];
    await target.query("SELECT set_config('event1.app_role', $1, true)", [appRole]);
    for (const { version, file } of migrations) {
      const migration = await readFile(file, "utf8");
      const checksum = createHash("sha256").update(migration).digest("hex");
      const previous = await target.query(
        "SELECT checksum FROM event_migrations WHERE version = $1",
        [version],
      );
      if (previous.rows[0] && previous.rows[0].checksum !== checksum) {
        throw new Error("Applied event migration checksum changed");
      }
      if (!previous.rows[0]) {
        await target.query(migration);
        await target.query("INSERT INTO event_migrations (version, checksum) VALUES ($1, $2)", [
          version,
          checksum,
        ]);
      }
    }
    await target.query("REVOKE CREATE ON SCHEMA public FROM PUBLIC");
    await target.query("COMMIT");
  } catch (error) {
    await target.query("ROLLBACK");
    throw error;
  }
  const app = connection(appUrl, database);
  try {
    await app.connect();
    const result = await app.query(`SELECT current_database() AS database,
      has_table_privilege(current_user, 'event_1.event_applications', 'INSERT') AS can_insert,
      has_table_privilege(current_user, 'event_1.event_applications', 'DELETE') AS can_delete,
      has_schema_privilege(current_user, 'event_1', 'CREATE') AS can_create`);
    if (!result.rows[0].can_insert || result.rows[0].can_delete || result.rows[0].can_create) {
      throw new Error("Event application role privileges do not match");
    }
    console.log(JSON.stringify({ ready: true, database, restrictedApplicationRole: true }));
  } finally {
    await app.end();
  }
} catch (error) {
  console.error(
    error instanceof Error && "code" in error
      ? `Event database preparation failed (${String(error.code)})`
      : error instanceof Error
        ? error.message
        : "Event database preparation failed",
  );
  process.exitCode = 1;
} finally {
  await target.end();
  await admin.end();
}

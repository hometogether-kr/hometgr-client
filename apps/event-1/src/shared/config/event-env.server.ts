import "server-only";

import { z } from "zod";

const eventEnvSchema = z.object({
  EVENT_APP_ENV: z.enum(["local", "development", "production"]),
  EVENT_PUBLIC_URL: z.url(),
  EVENT_DATABASE_URL: z.url(),
  EVENT_DATABASE_SSL: z.enum(["disable", "verify-full"]).default("verify-full"),
  EVENT_DATABASE_CA: z.string().min(1).optional(),
  EVENT_SUPABASE_PROJECT_REF: z
    .string()
    .regex(/^[a-z]{20}$/)
    .optional(),
  EVENT_CONSENT_VERSION: z.string().trim().min(1).max(80),
  EVENT_INTAKE_OPEN: z.enum(["true", "false"]).default("false"),
  EVENT_CLOSES_AT: z.iso.datetime({ offset: true }).optional(),
});

export function getEventConfig() {
  const env = eventEnvSchema.parse(process.env);
  const databaseUrl = new URL(env.EVENT_DATABASE_URL);
  const database = decodeURIComponent(databaseUrl.pathname.slice(1));
  const expectedDatabase =
    env.EVENT_APP_ENV === "production" ? "hometogether_event_1" : "hometogether_event_1_dev";

  if (!["postgres:", "postgresql:"].includes(databaseUrl.protocol)) {
    throw new Error("Event database must use PostgreSQL");
  }
  if (env.EVENT_SUPABASE_PROJECT_REF) {
    const projectRef = env.EVENT_SUPABASE_PROJECT_REF;
    const isDirectConnection =
      databaseUrl.hostname === `db.${projectRef}.supabase.co` &&
      decodeURIComponent(databaseUrl.username) === "event1_app";
    const isPooledConnection =
      databaseUrl.hostname.endsWith(".pooler.supabase.com") &&
      decodeURIComponent(databaseUrl.username) === `event1_app.${projectRef}`;
    if (
      database !== "postgres" ||
      (!isDirectConnection && !isPooledConnection) ||
      env.EVENT_DATABASE_SSL !== "verify-full"
    ) {
      throw new Error("Supabase connection must match the event project and server role");
    }
  } else if (database !== expectedDatabase) {
    throw new Error("Event database configuration does not match the event environment");
  }

  return {
    database: {
      host: databaseUrl.hostname,
      port: Number(databaseUrl.port || 5432),
      database,
      user: decodeURIComponent(databaseUrl.username),
      password: decodeURIComponent(databaseUrl.password),
      ssl:
        env.EVENT_DATABASE_SSL === "verify-full"
          ? { rejectUnauthorized: true, ca: env.EVENT_DATABASE_CA }
          : false,
    },
    origin: new URL(env.EVENT_PUBLIC_URL).origin,
    consentVersion: env.EVENT_CONSENT_VERSION,
    intakeOpen: env.EVENT_INTAKE_OPEN === "true",
    closesAt: env.EVENT_CLOSES_AT ? new Date(env.EVENT_CLOSES_AT) : undefined,
  };
}

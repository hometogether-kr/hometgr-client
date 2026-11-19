import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { createHmac, randomBytes, randomInt, randomUUID } from "node:crypto";
import { once } from "node:events";
import { mkdir, readFile, rmdir, unlink, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { resolve } from "node:path";
import { setTimeout } from "node:timers/promises";
import { parseEnv } from "node:util";

const database = new URL(process.env.EVENT_DATABASE_URL);
if (
  process.env.EVENT_APP_ENV !== "local" ||
  database.hostname !== "127.0.0.1" ||
  database.pathname !== "/hometogether_event_1_dev"
)
  throw new Error("Password verification requires the dedicated local event database");
if (!/^[A-Za-z0-9_-]{32,128}$/.test(process.env.EVENT_OPS_SESSION_SECRET ?? ""))
  throw new Error("Configure a session secret before verification");
const nextCli = resolve("node_modules/next/dist/bin/next");
const configureScript = resolve("scripts/configure-ops-access.mjs");
let previousCookie;

async function availablePort() {
  const probe = createServer();
  probe.listen(0, "127.0.0.1");
  await once(probe, "listening");
  const address = probe.address();
  assert.ok(address && typeof address !== "string");
  await new Promise((resolveClose) => probe.close(resolveClose));
  return address.port;
}

async function withServer(password, secret, verify) {
  const port = await availablePort();
  const origin = `http://127.0.0.1:${port}`;
  const env = {
    ...process.env,
    EVENT_OPS_ACCESS_KEY: password,
    EVENT_OPS_SESSION_SECRET: secret,
    EVENT_PUBLIC_URL: origin,
  };
  const child = spawn(process.execPath, [nextCli, "start", "-H", "127.0.0.1", "-p", String(port)], {
    env,
    stdio: ["ignore", "ignore", "ignore"],
    windowsHide: true,
  });
  const ended = once(child, "exit");
  try {
    let ready = false;
    for (let index = 0; index < 150; index++) {
      if (child.exitCode !== null)
        throw new Error("Password verification server exited before startup");
      try {
        if (
          (await fetch(`${origin}/event_1`, { signal: AbortSignal.timeout(1000) })).status === 200
        ) {
          ready = true;
          break;
        }
      } catch {
        /* Wait for this server's loopback listener. */
      }
      await setTimeout(100);
    }
    assert.ok(ready, "Password verification server did not become ready");
    await verify(origin, env);
  } finally {
    if (child.exitCode === null) child.kill();
    await ended;
  }
}

async function verifyPassword(password, secret, includeFullRegression = false) {
  await withServer(password, secret, async (origin, env) => {
    const listUrl = `${origin}/event_1/api/ops/applications`;
    assert.equal((await fetch(listUrl)).status, 401);
    if (previousCookie)
      assert.equal((await fetch(listUrl, { headers: { Cookie: previousCookie } })).status, 401);
    const signIn = (value) =>
      fetch(`${origin}/event_1/api/ops/session`, {
        method: "POST",
        redirect: "manual",
        headers: { Origin: origin, "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ accessKey: value }),
      });
    const rejected = await signIn(`${password}wrong`);
    assert.equal(rejected.status, 303);
    assert.ok(
      rejected.headers.get("set-cookie") === null,
      "Wrong passwords must not create sessions",
    );
    const accepted = await signIn(password);
    assert.equal(accepted.status, 303);
    assert.ok(
      accepted.headers.get("set-cookie")?.startsWith("ht-event1-ops="),
      "The configured password must authenticate",
    );
    const cookie = accepted.headers.get("set-cookie").split(";")[0];
    assert.equal((await fetch(listUrl, { headers: { Cookie: cookie } })).status, 200);
    const now = Math.floor(Date.now() / 1000);
    const payload = Buffer.from(
      JSON.stringify({
        version: 2,
        issuedAt: now,
        expiresAt: now + 28800,
        nonce: randomBytes(18).toString("base64url"),
      }),
    ).toString("base64url");
    const signature = createHmac("sha256", password)
      .update(`event1-operator-session:v2:${payload}`)
      .digest("base64url");
    assert.equal(
      (await fetch(listUrl, { headers: { Cookie: `ht-event1-ops=${payload}.${signature}` } }))
        .status,
      401,
    );
    previousCookie = cookie;
    if (includeFullRegression)
      execFileSync(process.execPath, [resolve("scripts/verify-ops.mjs")], {
        env,
        stdio: "inherit",
      });
  });
}

const secret = process.env.EVENT_OPS_SESSION_SECRET;
await verifyPassword(String(randomInt(1000, 10000)), secret, true);
console.log("Passed four-character password and full operator/student regression.");
await verifyPassword("비번!#$=42", secret);
await verifyPassword(" code=#42 ", secret);
const longPassword = "한".repeat(128);
await verifyPassword(longPassword, secret);
await verifyPassword(longPassword, randomBytes(32).toString("base64url"));
console.log(
  "Passed Unicode, symbols, exact spaces, 128-character input, password/session-secret rotation and password-only forgery rejection.",
);
for (const [password, configuredSecret] of [
  ["123", secret],
  ["    ", secret],
  ["1234", ""],
]) {
  await withServer(password, configuredSecret, async (origin) => {
    assert.equal((await fetch(`${origin}/event_1/api/ops/applications`)).status, 503);
    assert.equal((await fetch(`${origin}/event_1`)).status, 200);
  });
}

const directory = resolve(".local", `ops-password-config-${randomUUID()}`);
const environmentFile = resolve(directory, ".env.local");
await mkdir(directory, { recursive: true });
try {
  const password = " quoted=#42 ";
  await writeFile(environmentFile, `EVENT_OPS_ACCESS_KEY="${password}"\n`);
  execFileSync(process.execPath, [configureScript, ".env.local"], {
    cwd: directory,
    stdio: "pipe",
  });
  const configured = await readFile(environmentFile, "utf8");
  const parsed = parseEnv(configured);
  assert.ok(
    parsed.EVENT_OPS_ACCESS_KEY === password,
    "Setup must preserve the exact user password",
  );
  assert.ok(
    /^[A-Za-z0-9_-]{32,128}$/.test(parsed.EVENT_OPS_SESSION_SECRET),
    "Setup must generate a long independent signing secret",
  );
  execFileSync(process.execPath, [configureScript, ".env.local"], {
    cwd: directory,
    stdio: "pipe",
  });
  assert.ok(
    (await readFile(environmentFile, "utf8")) === configured,
    "Repeated setup must preserve both values",
  );
} finally {
  await unlink(environmentFile);
  await rmdir(directory);
}
console.log(
  "Passed fail-closed configuration and idempotent setup without changing the user password.",
);

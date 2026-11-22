import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import pg from "pg";
import ts from "typescript";

const databaseUrl = new URL(process.env.EVENT_DATABASE_URL);
const adminUrl = new URL(process.env.EVENT_DATABASE_ADMIN_URL);
if (
  process.env.EVENT_APP_ENV !== "local" ||
  databaseUrl.hostname !== "127.0.0.1" ||
  adminUrl.hostname !== databaseUrl.hostname ||
  databaseUrl.pathname !== "/hometogether_event_1_dev"
)
  throw new Error("Alimtalk verification requires the dedicated local database");

// Reuse TypeScript already installed in this app; no test runner or extra dependency.
const output = resolve(".local/alimtalk-verification");
const compiled = new Map();
async function compileModule(file) {
  const target = resolve(output, relative(resolve("src"), file)).replace(/\.ts$/, ".mjs");
  if (compiled.has(file)) return compiled.get(file);
  compiled.set(file, target);
  let source = ts
    .transpileModule(await readFile(file, "utf8"), {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
    })
    .outputText.replace(/import ["']server-only["'];?/g, "");
  const imports = [...source.matchAll(/from\s+["']([^"']+)["']/g)];
  for (const [, specifier] of imports) {
    if (!specifier.startsWith(".") && !specifier.startsWith("@/")) continue;
    const base = specifier.startsWith("@/")
      ? resolve("src", specifier.slice(2))
      : resolve(dirname(file), specifier);
    let dependency;
    try {
      await readFile(`${base}.ts`);
      dependency = `${base}.ts`;
    } catch {
      dependency = resolve(base, "index.ts");
    }
    const child = await compileModule(dependency);
    source = source.replaceAll(`"${specifier}"`, JSON.stringify(pathToFileURL(child).href));
  }
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, source);
  return target;
}

const { dispatchAlimtalk } = await import(
  pathToFileURL(await compileModule(resolve("src/domains/event-alimtalk/index.ts")))
);
const { handleAlimtalkDispatch } = await import(
  pathToFileURL(await compileModule(resolve("src/features/dispatch-alimtalk/index.ts")))
);
const { RECEIPT_TEMPLATE_CONTENT } = await import(
  pathToFileURL(
    await compileModule(resolve("src/domains/event-alimtalk/config/alimtalk-config.server.ts")),
  )
);
const admin = new pg.Client({ connectionString: new URL(databaseUrl.pathname, adminUrl).href });
await admin.connect();
const fixtureSource = `alimtalk-check-${randomUUID()}`;
const fixtureIds = [];
const originalFetch = globalThis.fetch;
process.env.NHN_ALIMTALK_APP_KEY = "fixture-app";
process.env.NHN_ALIMTALK_SECRET_KEY = "fixture-secret";
process.env.NHN_ALIMTALK_SENDER_KEY = "f".repeat(40);
process.env.EVENT_ALIMTALK_DISPATCH_SECRET = "test-secret-".repeat(4);
let templateStatus = "TSC03";
let templateContent = RECEIPT_TEMPLATE_CONTENT;
let sendMode = "success";
let templateCalls = 0;
let sendCalls = 0;
globalThis.fetch = async (url, options) => {
  assert.equal(new URL(url).hostname, "kakaotalk-bizmessage.api.nhncloudservice.com");
  assert.equal(options.redirect, "manual");
  if (String(url).includes("/templates/")) {
    templateCalls++;
    return Response.json({
      header: { isSuccessful: true, resultCode: 0 },
      template: {
        templateCode: "ht_event1_received",
        templateContent,
        status: templateStatus,
        block: false,
        dormant: false,
        buttons: [],
        quickReplies: [],
      },
    });
  }
  sendCalls++;
  const body = JSON.parse(options.body);
  assert.equal(body.templateCode, "ht_event1_received");
  assert.equal(body.recipientList.length, 1);
  assert.equal(body.recipientList[0].recipientNo, "01000000000");
  assert.equal(body.recipientList[0].resendParameter.isResend, false);
  assert.ok(options.headers["X-NC-API-IDEMPOTENCY-KEY"]);
  assert.equal(body.recipientList[0].templateParameter, undefined);
  if (sendMode === "timeout") throw new Error("Simulated uncertain acceptance");
  if (sendMode === "rate-limit")
    return Response.json({ header: { isSuccessful: false, resultCode: -429 } }, { status: 429 });
  if (sendMode === "rejected")
    return Response.json({ header: { isSuccessful: false, resultCode: -400 } });
  return Response.json({
    header: { isSuccessful: true, resultCode: 0 },
    message: {
      requestId: "fixture-request",
      sendResults: [{ resultCode: 0, recipientSeq: 0, recipientNo: "01000000000" }],
    },
  });
};

async function fixture() {
  const id = randomUUID();
  fixtureIds.push(id);
  await admin.query(
    `INSERT INTO event_1.event_applications
    (id, submission_key, request_fingerprint, university_campus, phone, email, consent_version, source)
    VALUES ($1, $2, $3, '검증대학교', '01000000000', 'alimtalk@example.invalid', 'test', $4)`,
    [id, randomUUID(), "0".repeat(64), fixtureSource],
  );
  await admin.query(
    `INSERT INTO event_1.event_alimtalk_jobs (id, application_id, kind)
    VALUES ($1, $2, 'APPLICATION_RECEIVED')`,
    [randomUUID(), id],
  );
  return id;
}
async function job(id) {
  return (
    await admin.query(
      "SELECT status, attempts, last_error_code, provider_request_id, provider_recipient_seq FROM event_1.event_alimtalk_jobs WHERE application_id=$1",
      [id],
    )
  ).rows[0];
}
try {
  const id = await fixture();
  process.env.EVENT_ALIMTALK_ENABLED = "false";
  assert.equal((await dispatchAlimtalk({ applicationId: id })).state, "disabled");
  assert.equal(templateCalls + sendCalls, 0);
  process.env.EVENT_ALIMTALK_ENABLED = "true";
  templateStatus = "TSC02";
  assert.equal((await dispatchAlimtalk({ applicationId: id })).state, "TEMPLATE_NOT_APPROVED");
  assert.equal((await job(id)).attempts, 0);
  assert.equal(sendCalls, 0);
  templateStatus = "TSC03";
  templateContent = "Changed template";
  assert.equal((await dispatchAlimtalk({ applicationId: id })).state, "TEMPLATE_CONTENT_MISMATCH");
  assert.equal(sendCalls, 0);
  templateContent = RECEIPT_TEMPLATE_CONTENT;
  const parallel = await Promise.all(
    Array.from({ length: 6 }, () => dispatchAlimtalk({ applicationId: id })),
  );
  assert.equal(
    parallel.reduce((sum, result) => sum + result.processed, 0),
    1,
  );
  assert.equal(sendCalls, 1);
  assert.deepEqual(await job(id), {
    status: "SUBMITTED",
    attempts: 1,
    last_error_code: null,
    provider_request_id: "fixture-request",
    provider_recipient_seq: 0,
  });

  const uncertain = await fixture();
  sendMode = "timeout";
  await dispatchAlimtalk({ applicationId: uncertain });
  await dispatchAlimtalk({ applicationId: uncertain });
  assert.equal(sendCalls, 2);
  assert.equal((await job(uncertain)).last_error_code, "ACCEPTANCE_UNKNOWN");

  const rejected = await fixture();
  sendMode = "rejected";
  await dispatchAlimtalk({ applicationId: rejected });
  assert.equal((await job(rejected)).status, "FAILED");
  const limited = await fixture();
  sendMode = "rate-limit";
  for (let attempt = 1; attempt <= 3; attempt++) {
    await dispatchAlimtalk({ applicationId: limited });
    assert.equal((await job(limited)).attempts, attempt);
    assert.equal((await job(limited)).status, attempt < 3 ? "PENDING" : "FAILED");
    await admin.query(
      "UPDATE event_1.event_alimtalk_jobs SET available_at=now() WHERE application_id=$1",
      [limited],
    );
  }
  const stale = await fixture();
  await admin.query(
    `UPDATE event_1.event_alimtalk_jobs SET status='PROCESSING', attempts=1,
    lease_token=$2, updated_at=now()-interval '6 minutes' WHERE application_id=$1`,
    [stale, randomUUID()],
  );
  const before = sendCalls;
  await dispatchAlimtalk({ applicationId: stale });
  assert.equal(sendCalls, before);
  assert.equal((await job(stale)).last_error_code, "ACCEPTANCE_UNKNOWN");
  const role = decodeURIComponent(databaseUrl.username);
  const privileges = (
    await admin.query(
      `SELECT
    has_column_privilege($1, 'event_1.event_alimtalk_jobs', 'status', 'UPDATE') AS can_advance,
    has_column_privilege($1, 'event_1.event_alimtalk_jobs', 'application_id', 'UPDATE') AS can_reassign,
    has_table_privilege($1, 'event_1.event_applications', 'UPDATE') AS can_edit_contacts,
    has_table_privilege($1, 'event_1.event_alimtalk_jobs', 'DELETE') AS can_delete`,
      [role],
    )
  ).rows[0];
  assert.deepEqual(privileges, {
    can_advance: true,
    can_reassign: false,
    can_edit_contacts: false,
    can_delete: false,
  });
  const request = (authorization) =>
    new Request("https://example.invalid/event_1/api/internal/alimtalk", {
      method: "POST",
      headers: authorization ? { Authorization: authorization } : {},
    });
  assert.equal((await handleAlimtalkDispatch(request())).status, 401);
  assert.equal((await handleAlimtalkDispatch(request("Bearer wrong"))).status, 401);
  process.env.EVENT_ALIMTALK_ENABLED = "false";
  assert.equal(
    (
      await (
        await handleAlimtalkDispatch(
          request(`Bearer ${process.env.EVENT_ALIMTALK_DISPATCH_SECRET}`),
        )
      ).json()
    ).state,
    "disabled",
  );

  const worker = (await import("../../../cloudflare/event-alimtalk/worker.mjs")).default;
  let cronCalls = 0;
  globalThis.fetch = async (url, options) => {
    cronCalls++;
    assert.equal(url, "https://hometogether-event-1.vercel.app/event_1/api/internal/alimtalk");
    assert.equal(options.method, "POST");
    assert.equal(options.redirect, "manual");
    assert.equal(
      options.headers.Authorization,
      `Bearer ${process.env.EVENT_ALIMTALK_DISPATCH_SECRET}`,
    );
    return Response.json({ state: "disabled", processed: 0 });
  };
  await worker.scheduled({}, { EVENT_ALIMTALK_ENABLED: "false" });
  assert.equal(cronCalls, 0);
  await worker.scheduled(
    {},
    {
      EVENT_ALIMTALK_ENABLED: "true",
      EVENT_ALIMTALK_DISPATCH_SECRET: process.env.EVENT_ALIMTALK_DISPATCH_SECRET,
    },
  );
  assert.equal(cronCalls, 1);
  assert.equal((await worker.fetch()).status, 404);
  console.log(
    "Passed Alimtalk verification: disabled/approval/content gates, atomic concurrent claims, acceptance recording, uncertain-send quarantine, bounded explicit rate-limit retries, expired lease quarantine, restricted grants and dispatch authentication. No actual messages sent.",
  );
} finally {
  globalThis.fetch = originalFetch;
  await admin.query(
    `DELETE FROM event_1.event_alimtalk_jobs WHERE application_id IN
    (SELECT id FROM event_1.event_applications WHERE id=ANY($1::uuid[]) AND source=$2)`,
    [fixtureIds, fixtureSource],
  );
  await admin.query(
    "DELETE FROM event_1.event_applications WHERE id=ANY($1::uuid[]) AND source=$2",
    [fixtureIds, fixtureSource],
  );
  await globalThis.event1DatabasePool?.end();
  await admin.end();
}

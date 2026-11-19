import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import pg from "pg";

const url = new URL(process.env.EVENT_DATABASE_URL);
const publicUrl = new URL(process.env.EVENT_PUBLIC_URL);
if (
  process.env.EVENT_APP_ENV !== "local" ||
  !["127.0.0.1", "localhost"].includes(publicUrl.hostname) ||
  !["127.0.0.1", "localhost"].includes(url.hostname) ||
  url.pathname !== "/hometogether_event_1_dev"
) {
  throw new Error("Verification requires the local event database and local HTTP server");
}
const db = new pg.Client({ connectionString: url.href });
await db.connect();
const endpoint = new URL("/event_1/api/applications", publicUrl);
const body = {
  universityCampus: "검증대학교 테스트캠퍼스",
  phone: "010-0000-0000",
  email: "event-test@example.invalid",
  consentAccepted: true,
  source: "local-verification",
};
async function submit(key, value = body, extra = {}) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: publicUrl.origin,
      "Idempotency-Key": key,
      ...extra,
    },
    body: JSON.stringify(value),
  });
  return {
    status: response.status,
    body: await response.json(),
    cache: response.headers.get("cache-control"),
  };
}
try {
  const key = randomUUID();
  const concurrent = await Promise.all(Array.from({ length: 8 }, () => submit(key)));
  assert.equal(concurrent.filter((result) => result.status === 201).length, 1);
  assert.equal(concurrent.filter((result) => result.status === 200).length, 7);
  assert.equal(new Set(concurrent.map((result) => result.body.applicationId)).size, 1);
  assert.ok(concurrent.every((result) => result.cache.includes("no-store")));
  assert.ok(concurrent.every((result) => !JSON.stringify(result.body).includes(body.email)));
  const stored = await db.query(
    `SELECT a.phone, a.university_campus,
    (SELECT count(*)::int FROM event_1.event_alimtalk_jobs j WHERE j.application_id = a.id) AS jobs
    FROM event_1.event_applications a WHERE submission_key = $1`,
    [key],
  );
  assert.equal(stored.rowCount, 1);
  assert.equal(stored.rows[0].phone, "01000000000");
  assert.equal(stored.rows[0].jobs, 1);
  assert.equal((await submit(key, { ...body, universityCampus: "다른대학교" })).status, 409);
  assert.equal((await submit(randomUUID(), { ...body, consentAccepted: false })).status, 400);
  assert.equal((await submit(randomUUID(), { ...body, universityCampus: "" })).status, 400);
  assert.equal((await submit(randomUUID(), { ...body, phone: "010" })).status, 400);
  assert.equal((await submit("invalid-key")).status, 400);
  assert.equal(
    (await submit(randomUUID(), body, { Origin: "https://invalid.example" })).status,
    403,
  );
  assert.equal((await submit(randomUUID(), { ...body, extra: "x".repeat(5000) })).status, 413);
  const secondKey = randomUUID();
  assert.equal(
    (await submit(secondKey, { ...body, universityCampus: "두번째대학교" })).status,
    201,
  );
  assert.equal(
    (
      await db.query(
        "SELECT university_campus FROM event_1.event_applications WHERE submission_key = $1",
        [secondKey],
      )
    ).rows[0].university_campus,
    "두번째대학교",
  );
  console.log(
    "Passed real HTTP/PostgreSQL verification: concurrent replay, outbox atomicity, masked response, input, origins, payload limit and multiple universities.",
  );
} finally {
  await db.end();
}

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import pg from "pg";

const appUrl = new URL(process.env.EVENT_DATABASE_URL);
const adminUrl = new URL(process.env.EVENT_DATABASE_ADMIN_URL);
const origin = new URL(process.env.EVENT_PUBLIC_URL);
if (
  process.env.EVENT_APP_ENV !== "local" ||
  appUrl.hostname !== "127.0.0.1" ||
  adminUrl.hostname !== appUrl.hostname ||
  appUrl.pathname !== "/hometogether_event_1_dev" ||
  !["127.0.0.1", "localhost"].includes(origin.hostname)
)
  throw new Error("Move-in verification requires the local event app and database");
if (process.env.EVENT_ALIMTALK_ENABLED === "true")
  throw new Error("Keep Alimtalk disabled during local move-in verification");
const db = new pg.Client({ connectionString: new URL(appUrl.pathname, adminUrl).href });
await db.connect();
const source = `move-in-check-${randomUUID()}`;
const body = {
  universityCampus: "입주시점 검증대학교",
  phone: "01000000000",
  email: "move-in@example.invalid",
  consentAccepted: true,
  source,
  moveInTiming: { year: 2027, month: 3, period: "mid" },
};
async function submit(input, key = randomUUID()) {
  return fetch(new URL("/event_1/api/applications", origin), {
    method: "POST",
    headers: {
      Origin: origin.origin,
      "Content-Type": "application/json",
      "Idempotency-Key": key,
    },
    body: JSON.stringify(input),
  });
}
try {
  const { moveInTiming: omitted, ...withoutTiming } = body;
  assert.ok(omitted);
  assert.equal((await submit(withoutTiming)).status, 400);
  for (const invalid of [
    {},
    { ...body.moveInTiming, month: 0 },
    { ...body.moveInTiming, month: 13 },
    { ...body.moveInTiming, year: 27 },
    { ...body.moveInTiming, period: "unknown" },
    { ...body.moveInTiming, year: "2027" },
    null,
  ])
    assert.equal((await submit({ ...body, moveInTiming: invalid })).status, 400);
  const ids = [];
  for (const period of ["early", "mid", "late"]) {
    const key = randomUUID();
    const input = { ...body, moveInTiming: { ...body.moveInTiming, period } };
    const response = await submit(input, key);
    assert.equal(response.status, 201);
    const saved = await response.json();
    ids.push(saved.applicationId);
    const row = (
      await db.query(
        `SELECT move_in_year, move_in_month, move_in_period,
      (SELECT count(*)::int FROM event_1.event_alimtalk_jobs WHERE application_id=a.id) AS jobs
      FROM event_1.event_applications a WHERE id=$1 AND source=$2`,
        [saved.applicationId, source],
      )
    ).rows[0];
    assert.deepEqual(row, {
      move_in_year: 2027,
      move_in_month: 3,
      move_in_period: period,
      jobs: 1,
    });
    assert.equal((await submit(input, key)).status, 200);
    assert.equal(
      (await submit({ ...input, moveInTiming: { ...input.moveInTiming, month: 4 } }, key)).status,
      409,
    );
  }
  const legacyId = randomUUID();
  await db.query(
    `INSERT INTO event_1.event_applications
    (id, submission_key, request_fingerprint, university_campus, phone, email, consent_version, source)
    VALUES ($1,$2,repeat('0',64),'기존 신청 검증','01000000000','move-in@example.invalid','test',$3)`,
    [legacyId, randomUUID(), source],
  );
  await assert.rejects(
    () =>
      db.query(
        `UPDATE event_1.event_applications
    SET move_in_year=2027 WHERE id=$1`,
        [legacyId],
      ),
    { code: "23514" },
  );
  const login = await fetch(new URL("/event_1/api/ops/session", origin), {
    method: "POST",
    redirect: "manual",
    headers: { Origin: origin.origin, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ accessKey: process.env.EVENT_OPS_ACCESS_KEY }),
  });
  assert.equal(login.status, 303);
  const cookie = login.headers.get("set-cookie")?.split(";")[0];
  assert.ok(cookie);
  const listResponse = await fetch(new URL("/event_1/api/ops/applications", origin), {
    headers: { Cookie: cookie },
  });
  assert.equal(listResponse.status, 200);
  const list = await listResponse.json();
  for (let index = 0; index < ids.length; index++) {
    const item = list.items.find((entry) => entry.id === ids[index]);
    assert.deepEqual(item?.moveInTiming, {
      year: 2027,
      month: 3,
      period: ["early", "mid", "late"][index],
    });
  }
  assert.equal(list.items.find((entry) => entry.id === legacyId)?.moveInTiming, null);
  const html = await (
    await fetch(new URL("/event_1/ops", origin), { headers: { Cookie: cookie } })
  ).text();
  for (const period of ["초", "중순", "말"]) assert.ok(html.includes(`2027년 3월 ${period}`));
  assert.ok(html.includes("미입력"));
  console.log(
    "Passed move-in-only verification: required input, year/month/period boundaries, all three periods stored, exact replay and changed-date conflict, legacy null handling, DB completeness constraint and operator display.",
  );
} finally {
  await db.query(
    `DELETE FROM event_1.event_alimtalk_jobs WHERE application_id IN
    (SELECT id FROM event_1.event_applications WHERE source=$1 AND email='move-in@example.invalid')`,
    [source],
  );
  await db.query(
    "DELETE FROM event_1.event_applications WHERE source=$1 AND email='move-in@example.invalid'",
    [source],
  );
  await db.end();
}

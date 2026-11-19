import assert from "node:assert/strict";
import { createHmac, randomUUID } from "node:crypto";
import pg from "pg";

const databaseUrl = new URL(process.env.EVENT_DATABASE_URL);
const publicUrl = new URL(process.env.EVENT_PUBLIC_URL);
const adminUrl = new URL(process.env.EVENT_DATABASE_ADMIN_URL);
if (
  process.env.EVENT_APP_ENV !== "local" ||
  !["127.0.0.1", "localhost"].includes(databaseUrl.hostname) ||
  !["127.0.0.1", "localhost"].includes(publicUrl.hostname) ||
  adminUrl.hostname !== "127.0.0.1" ||
  adminUrl.username !== "event1_local_admin" ||
  databaseUrl.pathname !== "/hometogether_event_1_dev"
)
  throw new Error(
    "Operator verification requires the dedicated local event database and local HTTP server",
  );
if (
  (process.env.EVENT_OPS_ACCESS_KEY?.trim().length ?? 0) < 4 ||
  !/^[A-Za-z0-9_-]{32,128}$/.test(process.env.EVENT_OPS_SESSION_SECRET ?? "")
)
  throw new Error("Configure an operator password and session secret before verification");
adminUrl.pathname = databaseUrl.pathname;
const db = new pg.Client({ connectionString: adminUrl.href });
const marker = `ops-verification-${randomUUID()}`;
const fullPhone = "01000000000";
const fullEmail = "operator-check@example.invalid";
const endpoint = "/event_1/api/ops/applications";
let cookie = "";

async function request(path, options = {}) {
  const response = await fetch(new URL(path, publicUrl), { ...options, redirect: "manual" });
  const control = response.headers.get("cache-control") ?? "";
  assert.ok(
    control.includes("no-store") ||
      (path.startsWith("/event_1/ops") && control.includes("no-cache")),
    `Missing cache protection: ${path}`,
  );
  return response;
}
function signIn(key, origin = publicUrl.origin) {
  return request("/event_1/api/ops/session", {
    method: "POST",
    headers: { Origin: origin, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ accessKey: key }),
  });
}
async function getList(page = 1) {
  const response = await request(`${endpoint}?page=${page}`, { headers: { Cookie: cookie } });
  assert.equal(response.status, 200);
  return response.json();
}

await db.connect();
try {
  assert.equal((await request(endpoint)).status, 401);
  assert.ok((await (await request("/event_1/ops")).text()).includes("운영자 비밀번호"));
  const wrong = await signIn("incorrect-code");
  assert.equal(wrong.status, 303);
  assert.ok(wrong.headers.get("location").includes("error=invalid"));
  assert.ok(wrong.headers.get("set-cookie") === null, "An invalid key must not create a session");
  assert.equal(
    (await signIn(process.env.EVENT_OPS_ACCESS_KEY, "https://invalid.example")).status,
    403,
  );
  const oversized = await signIn("x".repeat(1000));
  assert.ok(
    oversized.headers.get("set-cookie") === null,
    "Oversized input must not create a session",
  );
  const login = await signIn(process.env.EVENT_OPS_ACCESS_KEY);
  assert.equal(login.status, 303);
  const setCookie = login.headers.get("set-cookie");
  for (const flag of [/HttpOnly/i, /SameSite=strict/i, /Path=\/event_1/i])
    assert.ok(flag.test(setCookie), "Required session cookie flag missing");
  cookie = setCookie.split(";")[0];
  const baseline = Number(
    (await db.query("SELECT COUNT(*) AS total FROM event_1.event_applications")).rows[0].total,
  );
  const fixtureIds = Array.from({ length: 51 }, () => randomUUID());
  await db.query(
    `INSERT INTO event_1.event_applications (id, submission_key, request_fingerprint, university_campus, phone, email, consent_version, source)
    SELECT f.id, f.submission_key, repeat('0',64), '운영검증대학교 ' || f.n::text || '캠퍼스', $3, $4, 'ops-local-verification', $5
    FROM unnest($1::uuid[], $2::uuid[]) WITH ORDINALITY AS f(id, submission_key, n)`,
    [fixtureIds, fixtureIds.map(() => randomUUID()), fullPhone, fullEmail, marker],
  );
  const submissionKey = randomUUID();
  const studentBody = {
    universityCampus: "운영검증대학교 학생 신청",
    phone: fullPhone,
    email: fullEmail,
    consentAccepted: true,
    source: marker,
  };
  const studentOptions = {
    method: "POST",
    headers: {
      Origin: publicUrl.origin,
      "Content-Type": "application/json",
      "Idempotency-Key": submissionKey,
    },
    body: JSON.stringify(studentBody),
  };
  const accepted = await request("/event_1/api/applications", studentOptions);
  assert.equal(accepted.status, 201);
  fixtureIds.push((await accepted.json()).applicationId);
  assert.equal((await request("/event_1/api/applications", studentOptions)).status, 200);
  assert.equal(
    Number(
      (
        await db.query(
          "SELECT count(*) AS total FROM event_1.event_alimtalk_jobs WHERE application_id = $1",
          [fixtureIds.at(-1)],
        )
      ).rows[0].total,
    ),
    1,
  );
  const list = await getList();
  assert.equal(list.total, baseline + 52);
  assert.equal(list.items.length, 50);
  assert.equal(list.pageSize, 50);
  assert.equal(list.page, 1);
  for (const item of list.items)
    assert.deepEqual(Object.keys(item).sort(), ["email", "id", "phone", "universityCampus"]);
  const second = await getList(2);
  const observed = [...list.items, ...second.items];
  assert.equal(new Set(observed.map((item) => item.id)).size, Math.min(100, baseline + 52));
  const ownItems = observed.filter((item) => fixtureIds.includes(item.id));
  assert.equal(ownItems.length, 52);
  assert.ok(ownItems.every((item) => item.phone === fullPhone && item.email === fullEmail));
  assert.equal((await getList(9999)).page, Math.ceil((baseline + 52) / 50));
  for (const page of ["0", "1.5", "10001", "invalid"])
    assert.equal(
      (await request(`${endpoint}?page=${page}`, { headers: { Cookie: cookie } })).status,
      400,
    );
  const pageHtml = await (await request("/event_1/ops", { headers: { Cookie: cookie } })).text();
  assert.ok(pageHtml.includes(fullEmail) && pageHtml.includes(fullPhone));
  assert.ok(!pageHtml.includes("연락처 보기") && !pageHtml.includes("알림톡 상태"));
  const anonymousHtml = await (await request("/event_1/ops")).text();
  assert.ok(!anonymousHtml.includes(fullEmail) && !anonymousHtml.includes(fullPhone));
  assert.equal((await request(endpoint)).status, 401);
  assert.equal((await request(endpoint, { headers: { Cookie: `${cookie}tampered` } })).status, 401);
  const payload = Buffer.from(
    JSON.stringify({ version: 2, issuedAt: 1, expiresAt: 28801, nonce: "x".repeat(24) }),
  ).toString("base64url");
  const signingKey = createHmac("sha256", process.env.EVENT_OPS_SESSION_SECRET)
    .update("event1-operator-key:")
    .update(process.env.EVENT_OPS_ACCESS_KEY)
    .digest();
  const signature = createHmac("sha256", signingKey)
    .update(`event1-operator-session:v2:${payload}`)
    .digest("base64url");
  assert.equal(
    (await request(endpoint, { headers: { Cookie: `ht-event1-ops=${payload}.${signature}` } }))
      .status,
    401,
  );
  assert.equal(
    (
      await request("/event_1/api/ops/logout", {
        method: "POST",
        headers: { Cookie: cookie, Origin: "https://invalid.example" },
      })
    ).status,
    403,
  );
  const logout = await request("/event_1/api/ops/logout", {
    method: "POST",
    headers: { Cookie: cookie, Origin: publicUrl.origin },
  });
  assert.equal(logout.status, 303);
  assert.ok(
    /Max-Age=0/i.test(logout.headers.get("set-cookie")),
    "Logout must clear the session cookie",
  );
  assert.equal((await request(endpoint)).status, 401);
  console.log(
    "Passed operator HTTP/PostgreSQL verification: access gate, CSRF, bounded login input, cookie flags, unmasked three-field list, pagination, expired/tampered sessions, logout and unchanged student intake.",
  );
} finally {
  await db.query("BEGIN");
  try {
    await db.query(
      "DELETE FROM event_1.event_alimtalk_jobs j USING event_1.event_applications a WHERE j.application_id = a.id AND a.source = $1",
      [marker],
    );
    await db.query("DELETE FROM event_1.event_applications WHERE source = $1", [marker]);
    await db.query("COMMIT");
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  } finally {
    await db.end();
  }
}

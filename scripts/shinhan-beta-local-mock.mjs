import { spawn } from "node:child_process";
import { createHash, createHmac, randomBytes, randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

// SYNTHETIC ONLY: loopback, memory-only fixtures. This is not an Apps Script collector.
const clientPort = process.argv.includes("--fresh-origin") ? 3320 : 3319;
const origin = `http://127.0.0.1:${clientPort}`;
const mockOrigin = "http://127.0.0.1:4319";
const version = "0.1.0-draft.3";
const writeSecret = "synthetic-local-only-write-secret-2026";
const applications = new Map();
const requests = new Map();
const events = new Map();
const semanticEvents = new Map();
let collectorMode = "normal";
const counts = { applications: 0, concerns: 0, introductions: 0, collectorRequests: 0 };
const document =
  "합성 검증 전용 동의 문서입니다. 실제 개인정보를 입력하지 마세요. 외부 저장이나 알림 발송을 하지 않습니다.";

function respond(response, status, body, contract = "1.0.0") {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Shinhan-App-Env": "local",
    "X-Contract-Version": contract,
  });
  response.end(JSON.stringify(body));
}

function betaError(code, retryable = false) {
  return { ok: false, contract_version: version, error: { code, retryable, retry_after_ms: null } };
}

function collect(body) {
  counts.collectorRequests += 1;
  if (collectorMode === "unavailable") return betaError("COLLECTOR_UNAVAILABLE", true);
  const { contract_version, action, timestamp, nonce, payload_json, signature } = body;
  if (contract_version !== version || action !== "record_event")
    return betaError("SIGNATURE_REJECTED");
  const input = [contract_version, action, timestamp, nonce, payload_json].join("\n");
  if (createHmac("sha256", writeSecret).update(input).digest("hex") !== signature)
    return betaError("SIGNATURE_REJECTED");
  const event = JSON.parse(payload_json);
  const canonical = JSON.stringify(event);
  const semanticKey = [
    event.run_id,
    event.dataset,
    event.mission_id,
    event.attempt_id,
    event.event_name,
  ].join("/");
  const eventKey = [event.run_id, event.dataset, event.event_id].join("/");
  const previousById = events.get(eventKey);
  const previous = previousById ?? semanticEvents.get(semanticKey);
  if (previous) {
    const comparable = (value) => JSON.stringify({ ...value, event_id: undefined });
    if (comparable(previous.event) !== comparable(event))
      return betaError(previousById ? "EVENT_ID_CONFLICT" : "SEMANTIC_CONFLICT");
    return {
      ok: true,
      contract_version: version,
      data: {
        status: "duplicate",
        request_event_id: event.event_id,
        event_id: previous.event.event_id,
        received_at: previous.receivedAt,
        projection_state: "current",
      },
    };
  }
  const receivedAt = new Date().toISOString();
  const saved = { event, canonical, receivedAt };
  events.set(eventKey, saved);
  semanticEvents.set(semanticKey, saved);
  return {
    ok: true,
    contract_version: version,
    data: {
      status: "accepted",
      request_event_id: event.event_id,
      event_id: event.event_id,
      received_at: receivedAt,
      projection_state: "current",
    },
  };
}

function application(input) {
  const now = new Date().toISOString();
  return {
    applicationId: randomUUID(),
    campaign: "shinhan",
    phone: input.phone,
    createdAt: now,
    updatedAt: now,
    version: 1,
    requiredConsent: { ...input.requiredConsent, recordedAt: now },
    notification: { state: "NOT_REQUESTED", deliveredAt: null },
    applicationType: input.applicationType,
    input: input.input,
    concerns: { state: "NOT_SUBMITTED", codes: [], consent: null },
    estimate:
      input.applicationType === "HOST_ESTIMATE"
        ? {
            rulesVersion: "synthetic-only-v1",
            region: {
              source: "district",
              districtUsed: "노원구",
              fallbackReason: null,
              baseMonthlyWon: { min: 300000, max: 400000 },
            },
            adjustmentWon: 0,
            rawMonthlyWon: { min: 300000, max: 400000 },
            monthlyWon: { min: 300000, max: 400000 },
            annualWon: { min: 3600000, max: 4800000 },
            plannedFurnitureKeys: [],
          }
        : null,
    exampleContentVersion: input.applicationType.startsWith("GUEST_") ? "common-space-v1" : null,
    introductionRequestedAt: null,
  };
}

const server = createServer(async (request, response) => {
  try {
    if (request.headers.host !== "127.0.0.1:4319") return respond(response, 403, {});
    const url = new URL(request.url, mockOrigin);
    if (request.method === "GET" && url.pathname === "/__synthetic/status") {
      return respond(response, 200, {
        synthetic: true,
        collectorMode,
        counts,
        events: [...events.values()].map(({ event, receivedAt }) => ({
          ...event,
          received_at: receivedAt,
        })),
      });
    }
    let raw = "";
    for await (const chunk of request) {
      raw += chunk;
      if (Buffer.byteLength(raw) > 32768) return respond(response, 413, {});
    }
    const body = raw ? JSON.parse(raw) : {};
    if (request.method === "POST" && url.pathname === "/__synthetic/collector-mode") {
      if (!["normal", "unavailable"].includes(body.mode))
        return respond(response, 400, { synthetic: true });
      collectorMode = body.mode;
      return respond(response, 200, { synthetic: true, collectorMode });
    }
    if (request.method === "POST" && url.pathname === "/api/v1/beta/rpc")
      return respond(response, 200, collect(body), version);
    const route = url.pathname.replace(/^\/api\/v1\//, "");
    if (route === "consents" && request.method === "GET") {
      return respond(
        response,
        200,
        {
          data: {
            required: {
              version: "synthetic-consent-v1",
              content: document,
              sha256: createHash("sha256").update(document).digest("hex"),
            },
            localOnly: true,
          },
        },
        "2.0.0",
      );
    }
    if (route === "sessions" && request.method === "POST") {
      return respond(response, 201, {
        data: {
          sessionToken: randomBytes(32).toString("base64url"),
          expiresAt: new Date(Date.now() + 7200000).toISOString(),
        },
      });
    }
    const key = request.headers["idempotency-key"];
    if (key && requests.has(key)) {
      const saved = requests.get(key);
      response.setHeader("Idempotency-Replayed", "true");
      return respond(response, saved.status, saved.body, saved.contract);
    }
    if (route === "applications" && request.method === "POST") {
      // Only this deliberately non-contactable synthetic number is accepted.
      if (body.phone !== "01000000000")
        return respond(response, 422, {
          error: { code: "VALIDATION_ERROR", message: "합성 번호 01000000000만 사용하세요." },
        });
      const value = application(body);
      applications.set(value.applicationId, value);
      counts.applications += 1;
      const result = { data: value };
      if (key) requests.set(key, { status: 201, body: result, contract: "1.0.0" });
      return respond(response, 201, result);
    }
    const match = /^applications\/([0-9a-f-]+)\/(current|concerns)$/.exec(route);
    if (match && applications.has(match[1])) {
      const value = applications.get(match[1]);
      if (match[2] === "current" && request.method === "GET")
        return respond(response, 200, { data: value });
      if (match[2] === "concerns" && request.method === "PUT") {
        value.concerns = {
          state: body.state,
          codes: body.state === "SUBMITTED" ? body.concernCodes : [],
          consent: null,
        };
        value.updatedAt = new Date().toISOString();
        value.version += 1;
        counts.concerns += 1;
        const result = { data: value };
        if (key) requests.set(key, { status: 200, body: result, contract: "2.0.0" });
        return respond(response, 200, result, "2.0.0");
      }
    }
    // Introduction/notification/unknown endpoints are intentionally unavailable.
    return respond(response, 404, {
      error: { code: "NOT_FOUND", message: "합성 검증에서 제공하지 않는 경로입니다." },
    });
  } catch {
    respond(response, 400, { synthetic: true, error: "INVALID_SYNTHETIC_REQUEST" });
  }
});

server.listen(4319, "127.0.0.1", () =>
  console.log(`SYNTHETIC ONLY mock listening at ${mockOrigin}`),
);
server.on("error", (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
let child;
if (process.argv.includes("--dev")) {
  const root = fileURLToPath(new URL("../", import.meta.url));
  child = spawn(
    process.execPath,
    [
      resolve(root, "node_modules/next/dist/bin/next"),
      "dev",
      "--webpack",
      "--hostname",
      "127.0.0.1",
      "--port",
      String(clientPort),
    ],
    {
      cwd: root,
      stdio: "inherit",
      windowsHide: true,
      env: {
        ...process.env,
        NODE_ENV: "development",
        VERCEL: "0",
        SHINHAN_APP_ENV: "local",
        SHINHAN_CLIENT_IP_MODE: "local",
        SHINHAN_API_ORIGIN: mockOrigin,
        SHINHAN_ALLOWED_ORIGINS: origin,
        SHINHAN_BRIDGE_SECRET: "synthetic-local-bridge-secret-2026",
        SHINHAN_CLIENT_IP_HMAC_SECRET: "synthetic-local-ip-hmac-secret-2026",
        BETA_TRACKING_ENABLED: "true",
        BETA_TRACKING_MODE: "local",
        BETA_TRACKING_CONTEXT_ID: "synthetic-local-v1",
        BETA_RUN_ID: "synthetic-run-v1",
        BETA_DATASET: "connection_test",
        BETA_START_AT: "2026-01-01T00:00:00.000Z",
        BETA_TRACKING_ALLOWED_ORIGINS: origin,
        BETA_TRACKING_API_URL: `${mockOrigin}/api/v1/beta/rpc`,
        BETA_EVENT_WRITE_SECRET: writeSecret,
      },
    },
  );
  child.on("exit", () => server.close());
}
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => {
    child?.kill();
    server.close();
  });

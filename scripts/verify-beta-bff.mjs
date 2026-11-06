import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Synthetic, offline verification only. Every fetch is replaced before loading the BFF.
const root = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(resolve(root, "package.json"));
const ts = require("typescript");
const modules = new Map();
let checks = 0;
const transportOnly = process.argv.includes("--transport-only");
const deadlinesOnly = process.argv.includes("--deadlines-only");
const originalFetch = globalThis.fetch;
const originalEnvironment = { ...process.env };
const version = "0.1.0-draft.3";
const fixture = (name) =>
  JSON.parse(readFileSync(resolve(root, "docs/shinhan-beta-handoff/fixtures", name), "utf8"));
function check(actual, expected, name) {
  assert.deepEqual(actual, expected, name);
  checks += 1;
}
function loadTypeScript(filename) {
  const options = [filename, filename + ".ts", resolve(filename, "index.ts")];
  const target = options.find((candidate) => existsSync(candidate) && candidate.endsWith(".ts"));
  assert.ok(target, "Missing TypeScript source: " + filename);
  if (modules.has(target)) return modules.get(target).exports;
  const loadedModule = { exports: {} };
  modules.set(target, loadedModule);
  const source = readFileSync(target, "utf8");
  const result = ts.transpileModule(source, {
    fileName: target,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    reportDiagnostics: true,
  });
  assert.deepEqual(result.diagnostics ?? [], [], "Syntax: " + target);
  const localRequire = (name) => {
    if (name === "server-only") return {};
    if (name.startsWith("@/")) return loadTypeScript(resolve(root, "src", name.slice(2)));
    if (name.startsWith(".")) return loadTypeScript(resolve(dirname(target), name));
    return require(name);
  };
  new Function("require", "module", "exports", result.outputText)(
    localRequire,
    loadedModule,
    loadedModule.exports,
  );
  return loadedModule.exports;
}
const localEnvironment = {
  NODE_ENV: "development",
  SHINHAN_APP_ENV: "local",
  SHINHAN_CLIENT_IP_MODE: "local",
  SHINHAN_CF_INGRESS_SECRET: "",
  VERCEL_ENV: "development",
  VERCEL: "0",
  BETA_TRACKING_ENABLED: "true",
  BETA_TRACKING_MODE: "local",
  BETA_TRACKING_CONTEXT_ID: "synthetic-context-v1",
  BETA_RUN_ID: "synthetic-run-v1",
  BETA_DATASET: "connection_test",
  BETA_START_AT: "2000-01-01T00:00:00.000Z",
  BETA_TRACKING_ALLOWED_ORIGINS: "http://127.0.0.1:3319",
  BETA_TRACKING_API_URL: "http://127.0.0.1:4319/api/v1/beta/rpc",
  BETA_EVENT_WRITE_SECRET: "synthetic-local-only-write-secret-2026",
};
function configure(overrides = {}) {
  for (const key of Object.keys(process.env)) if (key.startsWith("BETA_")) delete process.env[key];
  Object.assign(process.env, localEnvironment, overrides);
}
function request(body, headers = {}, url = "http://127.0.0.1:3319/api/beta/events") {
  return new Request(url, {
    method: "POST",
    headers: {
      host: new URL(url).host,
      origin: new URL(url).origin,
      "sec-fetch-site": "same-origin",
      "content-type": "application/json",
      ...headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}
const jsonResponse = (body) =>
  new Response(JSON.stringify(body), { headers: {
    "Content-Type": "application/json", "X-Contract-Version": version,
    "X-Shinhan-App-Env": process.env.SHINHAN_APP_ENV,
  } });
let sent = [];
let stubResponse;
globalThis.fetch = async (url, init) => {
  check(String(url), process.env.BETA_TRACKING_API_URL, "fixed collector URL");
  check(init.method, "POST", "collector method");
  check(init.credentials, "omit", "no browser credentials");
  check(init.redirect, "manual", "redirect handling");
  check(init.headers, { "Content-Type": "application/json", Accept: "application/json" }, "only JSON headers forwarded");
  check(init.cache, "no-store", "transport no cache");
  check(init.referrerPolicy, "no-referrer", "no upstream referrer");
  const envelope = JSON.parse(init.body);
  const signingInput = [
    envelope.contract_version,
    envelope.action,
    envelope.timestamp,
    envelope.nonce,
    envelope.payload_json,
  ].join("\n");
  check(
    envelope.signature,
    createHmac("sha256", process.env.BETA_EVENT_WRITE_SECRET).update(signingInput).digest("hex"),
    "envelope HMAC",
  );
  sent.push(envelope);
  return typeof stubResponse === "function" ? stubResponse() : jsonResponse(stubResponse);
};

try {
  configure();
  const domain = loadTypeScript(resolve(root, "src/domains/beta-tracking/index.ts"));
  const configuration = loadTypeScript(
    resolve(root, "src/features/beta-tracking/config/environment.server.ts"),
  );
  const collector = loadTypeScript(
    resolve(root, "src/features/beta-tracking/api/collector.server.ts"),
  );
  const handler = loadTypeScript(resolve(root, "src/features/beta-tracking/api/handler.server.ts"));
  const records = fixture("events.synthetic.json").records;
  const invalidCases = fixture("invalid-input-cases.synthetic.json").cases;
  const recordCases = fixture("record-cases.synthetic.json").cases;
  const signing = fixture("signing-vector.synthetic.json");
  const acceptedCase = recordCases.find((item) => item.name === "accepted");
  const input = acceptedCase.request;
  const success = acceptedCase.response;

  const syntheticFetch = globalThis.fetch;
  const originalTimeout = AbortSignal.timeout;
  const originalWindow = globalThis.window;
  try {
    for (const appEnvironment of ["local", "test", "dev", "production"]) {
      for (const dataset of ["beta", "connection_test"]) {
        const remote = ["dev", "production"].includes(appEnvironment);
        configure(remote ? {
          NODE_ENV: "production", VERCEL: "1", VERCEL_ENV: appEnvironment === "dev" ? "preview" : "production",
          SHINHAN_APP_ENV: appEnvironment, SHINHAN_CLIENT_IP_MODE: "vercel-direct",
          BETA_TRACKING_MODE: "production", BETA_DATASET: dataset,
          BETA_TRACKING_ALLOWED_ORIGINS: "https://synthetic.example",
          BETA_TRACKING_API_URL: "https://" + (appEnvironment === "dev" ? "dev-shinhan-api" : "shinhan-api") + ".hometogether.kr/api/v1/beta/rpc",
          BETA_EVENT_WRITE_SECRET: "a".repeat(64),
        } : { SHINHAN_APP_ENV: appEnvironment, NODE_ENV: appEnvironment === "test" ? "test" : "development", BETA_DATASET: dataset });
        const allowed = dataset === (remote ? "beta" : "connection_test");
        check(configuration.getBetaTrackingEnvironment() !== null, allowed, "dataset fixed by runtime: " + appEnvironment + "/" + dataset);
        if (!allowed) {
          let forwarded = false;
          globalThis.fetch = async () => { forwarded = true; throw new Error("SYNTHETIC_FORBIDDEN_FETCH"); };
          check((await handler.handleBetaEvent(request(input))).status, 404, "invalid dataset leaves tracking disabled");
          check(forwarded, false, "invalid dataset makes no collector request");
        }
      }
    }
    configure();
    const budgets = [], controllers = [], bffRequests = [];
    AbortSignal.timeout = (milliseconds) => {
      budgets.push(milliseconds);
      const controller = new AbortController();
      controllers.push(controller);
      return controller.signal;
    };
    globalThis.fetch = async (_url, init) => {
      bffRequests.push({ signal: init.signal, envelope: JSON.parse(init.body) });
      return bffRequests.length === 1 ? jsonResponse({ ok: false, contract_version: version,
        error: { code: "REPLAYED_ENVELOPE", retryable: true, retry_after_ms: null } }) : jsonResponse(success);
    };
    const environment = configuration.getBetaTrackingEnvironment();
    check((await collector.recordBetaEvent(input.event, environment)).ok, true, "renewed envelope succeeds within shared budget");
    check(budgets, [18_000], "BFF gives both envelope attempts one 18 second budget");
    check(bffRequests[0].signal === bffRequests[1].signal, true, "retry does not reset BFF deadline");
    check(bffRequests[0].envelope.payload_json, bffRequests[1].envelope.payload_json, "deadline adjustment preserves exact event payload");
    check(bffRequests[0].envelope.nonce !== bffRequests[1].envelope.nonce, true, "envelope retry still uses a fresh nonce");
    globalThis.fetch = async (_url, init) => new Promise((_resolve, reject) => {
      init.signal.addEventListener("abort", () => reject(new Error("SYNTHETIC_TIMEOUT")), { once: true });
      queueMicrotask(() => controllers.at(-1).abort());
    });
    await assert.rejects(() => collector.recordBetaEvent(input.event, environment), { message: "COLLECTOR_UNAVAILABLE" });
    checks += 1;
    check(budgets.at(-1), 18_000, "BFF timeout uses the agreed budget");

    const delivery = loadTypeScript(resolve(root, "src/features/beta-tracking/api/events.ts"));
    const browserTimers = [], cleared = [], browserBodies = [];
    globalThis.window = {
      setTimeout(callback, milliseconds) { browserTimers.push({ callback, milliseconds }); return browserTimers.length; },
      clearTimeout(id) { cleared.push(id); },
    };
    globalThis.fetch = async (_url, init) => new Promise((_resolve, reject) => {
      browserBodies.push(init.body);
      init.signal.addEventListener("abort", () => reject(new Error("SYNTHETIC_TIMEOUT")), { once: true });
      queueMicrotask(() => browserTimers.at(-1).callback());
    });
    check(await delivery.sendBetaEvent(input), { kind: "retry", retryAfterMs: 0, missingPredecessor: false }, "browser timeout retains retryable event");
    check(browserTimers[0].milliseconds, 20_000, "browser allows 20 seconds for BFF response");
    globalThis.fetch = async (_url, init) => {
      browserBodies.push(init.body);
      return new Response(JSON.stringify(success), { status: 201, headers: jsonResponse(success).headers });
    };
    check(await delivery.sendBetaEvent(input), { kind: "accepted" }, "same browser event can succeed after timeout");
    check(browserBodies[0], browserBodies[1], "browser retry preserves exact serialized event and ID");
    check(cleared, [1, 2], "both browser paths clear their deadline timer");
    check(browserTimers.map(({milliseconds}) => milliseconds), [20_000, 20_000], "every browser request has its own bounded budget");
    check(15_000 < budgets[0] && budgets[0] < browserTimers[0].milliseconds, true, "server 15/BFF18/browser20 budget ordering");
  } finally {
    globalThis.fetch = syntheticFetch;
    AbortSignal.timeout = originalTimeout;
    if (originalWindow === undefined) delete globalThis.window; else globalThis.window = originalWindow;
  }
  if (deadlinesOnly) {
    console.log("PASS: " + checks + " offline dataset/deadline assertions; virtual deadlines, no network.");
  } else {


  check(domain.BETA_SCHEMA_VERSION, version, "contract version");
  for (const record of transportOnly ? [] : records) {
    const event = Object.fromEntries(
      Object.entries(record).filter(
        ([key]) => !["run_id", "dataset", "mission_id", "received_at"].includes(key),
      ),
    );
    check(
      domain.betaEventInputSchema.safeParse(event).success,
      true,
      "ledger fixture browser fields",
    );
    check(Object.keys(event).length, 13, "browser field count");
  }
  for (const item of transportOnly ? [] : [...recordCases, ...invalidCases]) {
    check(
      domain.betaEventResponseSchema.safeParse(item.response).success,
      true,
      item.name + " response schema",
    );
    check(
      domain.betaEventRequestSchema.safeParse(item.request).success,
      item.http_status !== 422,
      item.name + " request schema",
    );
  }
  const envelope = collector.createBetaEventEnvelope(
    JSON.parse(signing.envelope.payload_json),
    signing.fixture_key_utf8,
    { timestamp: signing.envelope.timestamp, nonce: signing.envelope.nonce },
  );
  check(envelope, signing.envelope, "frozen HMAC fixture");
  for (const item of signing.cases.filter((value) => value.name === "fresh_envelope_same_event")) {
    const signed = collector.createBetaEventEnvelope(
      JSON.parse(item.envelope.payload_json),
      signing.fixture_key_utf8,
      { timestamp: item.envelope.timestamp, nonce: item.envelope.nonce },
    );
    check(signed, item.envelope, "fresh envelope fixture");
  }

  check(
    configuration.getBetaTrackingContext(),
    { context_id: "synthetic-context-v1", completion_basis: "simulation" },
    "minimal public context",
  );
  configure({ BETA_END_AT: "2001-01-01T00:00:00.000Z" });
  check(
    configuration.getBetaTrackingContext() !== null,
    true,
    "past END_AT does not stop continuous collection",
  );
  configure({ BETA_START_AT: "2999-01-01T00:00:00.000Z" });
  check(configuration.getBetaTrackingContext(), null, "before start disabled");
  configure({ BETA_TRACKING_ENABLED: "false" });
  check(configuration.getBetaTrackingContext(), null, "explicit disabled");
  configure({ BETA_TRACKING_API_URL: "not-a-url" });
  check(configuration.getBetaTrackingContext(), null, "invalid config is harmless");
  const production = {
    NODE_ENV: "production",
    SHINHAN_APP_ENV: "production",
    SHINHAN_CLIENT_IP_MODE: "vercel-direct",
    VERCEL: "1",
    VERCEL_ENV: "production",
    BETA_TRACKING_MODE: "production",
    BETA_DATASET: "beta",
    BETA_TRACKING_ALLOWED_ORIGINS: "https://synthetic.example",
    BETA_TRACKING_API_URL: "https://shinhan-api.hometogether.kr/api/v1/beta/rpc",
    BETA_EVENT_WRITE_SECRET: "a".repeat(64),
  };
  configure(production);
  check(
    configuration.getBetaTrackingContext(),
    { context_id: "synthetic-context-v1", completion_basis: "saved_response" },
    "validated production config without network",
  );
  for (const overrides of [
    { BETA_TRACKING_ALLOWED_ORIGINS: "http://synthetic.example" },
    { BETA_TRACKING_API_URL: "https://script.google.com.evil.example/macros/s/id/exec" },
    { BETA_TRACKING_API_URL: "https://script.google.com/macros/s/id/dev" },
    { BETA_TRACKING_API_URL: "https://script.google.com/macros/s/id/exec?key=x" },
    { BETA_EVENT_WRITE_SECRET: signing.fixture_key_utf8 },
    { NODE_ENV: "development" },
  ]) {
    configure({ ...production, ...overrides });
    check(configuration.getBetaTrackingContext(), null, "unsafe production config disabled");
  }

  configure();
  for (const item of transportOnly ? [] : [...recordCases, ...invalidCases]) {
    sent = [];
    stubResponse = item.response;
    const response = await handler.handleBetaEvent(
      request(item.request, { cookie: "SYNTHETIC_COOKIE_NOT_FORWARDED" }),
    );
    check(response.status, item.http_status, item.name + " HTTP");
    check(await response.json(), item.response, item.name + " body");
    check(response.headers.get("cache-control"), "no-store", item.name + " no cache");
    const locallyRejected = item.http_status === 422 || item.name === "stale_context";
    check(sent.length, locallyRejected ? 0 : 1, item.name + " forwarding boundary");
    if (sent.length) {
      const payload = JSON.parse(sent[0].payload_json);
      check(Object.keys(payload).length, 16, "collector field count");
      check(payload.run_id, "synthetic-run-v1", "server run");
      check(payload.dataset, "connection_test", "server dataset");
      check(payload.mission_id, domain.BETA_MISSION_ID, "server mission");
      check("received_at" in payload, false, "collector owns received_at");
    }
  }

  const localFailures = [
    ["{", {}, 400, "INVALID_JSON"],
    [input, { origin: "https://other.example" }, 403, "ORIGIN_REJECTED"],
    [input, { host: "other.example" }, 403, "ORIGIN_REJECTED"],
    [input, { "sec-fetch-site": "cross-site" }, 403, "ORIGIN_REJECTED"],
    [input, { "content-type": "text/plain" }, 415, "UNSUPPORTED_MEDIA_TYPE"],
    [JSON.stringify({ extra: "가".repeat(1500) }), {}, 413, "PAYLOAD_TOO_LARGE"],
    [{ ...input, extra: true }, {}, 422, "INVALID_EVENT"],
    [
      { ...input, event: { ...input.event, schema_version: "0.1.0-draft.2" } },
      {},
      422,
      "UNSUPPORTED_VERSION",
    ],
    [{ ...input, event: { ...input.event, utm_content: "profile" } }, {}, 422, "INVALID_EVENT"],
    [
      { ...input, event: { ...input.event, received_at: input.event.occurred_at } },
      {},
      422,
      "INVALID_EVENT",
    ],
  ];
  for (const [body, headers, status, code] of transportOnly ? [] : localFailures) {
    sent = [];
    stubResponse = success;
    const response = await handler.handleBetaEvent(request(body, headers));
    check(response.status, status, code + " HTTP");
    check((await response.json()).error.code, code, code + " code");
    check(sent.length, 0, code + " no forwarding");
  }
  const badCollectorResponses = [
    () => new Response("<html>login</html>", { headers: { "Content-Type": "text/html" } }),
    () => new Response("{", { headers: { "Content-Type": "application/json" } }),
    () => new Response(null, { status: 302, headers: { location: "https://other.example" } }),
    () => jsonResponse({ ...success, contract_version: "0.1.0-draft.2" }),
    () =>
      jsonResponse({
        ...success,
        data: { ...success.data, request_event_id: "00000000-0000-4000-8000-000000008888" },
      }),
    () => jsonResponse({ ...success, data: { ...success.data, phone: "SYNTHETIC_FORBIDDEN" } }),
    () =>
      jsonResponse({
        ok: false,
        contract_version: version,
        error: { code: "AUTH_FAILED", retryable: false, retry_after_ms: null },
      }),
  ];
  for (const responseFactory of badCollectorResponses) {
    sent = [];
    stubResponse = responseFactory;
    const response = await handler.handleBetaEvent(request(input));
    check(response.status, 503, "invalid collector response HTTP");
    check(
      (await response.json()).error.code,
      "COLLECTOR_UNAVAILABLE",
      "invalid collector response hidden",
    );
  }
  sent = [];
  stubResponse = () =>
    sent.length === 1
      ? jsonResponse({
          ok: false,
          contract_version: version,
          error: { code: "REPLAYED_ENVELOPE", retryable: true, retry_after_ms: null },
        })
      : jsonResponse(success);
  check((await handler.handleBetaEvent(request(input))).status, 201, "fresh signed retry");
  check(sent.length, 2, "one server envelope retry");
  check(sent[0].payload_json, sent[1].payload_json, "retry payload stable");
  check(sent[0].nonce !== sent[1].nonce, true, "retry nonce fresh");


  // Only the changed transport and shared ingress boundary run with --transport-only.
  for (const overrides of [
    { BETA_TRACKING_API_URL: "http://127.0.0.1:4319/collector" },
    { BETA_TRACKING_API_URL: "http://127.0.0.1:4319/api/v1/beta/rpc?secret=synthetic" },
    { BETA_TRACKING_API_URL: "http://untrusted.invalid:4319/api/v1/beta/rpc" },
    { BETA_TRACKING_API_URL: "", BETA_TRACKING_WEB_APP_URL: localEnvironment.BETA_TRACKING_API_URL },
  ]) {
    configure(overrides);
    check(configuration.getBetaTrackingEnvironment(), null, "legacy or unapproved local target disabled");
  }
  for (const overrides of [
    { BETA_TRACKING_API_URL: "https://dev-shinhan-api.hometogether.kr/api/v1/beta/rpc" },
    { BETA_TRACKING_API_URL: "https://shinhan-api.hometogether.kr/api/v1/beta/rpc/" },
    { BETA_TRACKING_API_URL: "https://shinhan-api.hometogether.kr.evil.invalid/api/v1/beta/rpc" },
    { VERCEL_ENV: "preview" }, { SHINHAN_APP_ENV: "local" },
  ]) {
    configure({ ...production, ...overrides });
    check(configuration.getBetaTrackingEnvironment(), null, "environment and server target must match");
  }
  configure({ ...production, SHINHAN_APP_ENV: "dev", VERCEL_ENV: "preview",
    BETA_TRACKING_API_URL: "https://dev-shinhan-api.hometogether.kr/api/v1/beta/rpc" });
  check(configuration.getBetaTrackingEnvironment() !== null, true, "dev preview targets only dev API");
  configure({ SHINHAN_APP_ENV: "test", NODE_ENV: "test" });
  check(configuration.getBetaTrackingEnvironment() !== null, true, "explicit test loopback mode");
  configure();
  for (const status of [301, 302, 303, 307, 308]) {
    sent = [];
    stubResponse = () => new Response(null, { status, headers: {
      location: "https://script.googleusercontent.com/macros/echo?user_content_key=synthetic",
    } });
    const response = await handler.handleBetaEvent(request(input));
    check(response.status, 503, "all redirects rejected");
    check(sent.length, 1, "redirect target never requested");
  }
  for (const [header, value] of [
    ["X-Shinhan-App-Env", null], ["X-Shinhan-App-Env", "production"],
    ["X-Shinhan-App-Env", "local, production"], ["X-Contract-Version", null],
    ["X-Contract-Version", "0.1.0-draft.2"], ["Content-Type", "text/html"],
  ]) {
    sent = [];
    stubResponse = () => {
      const response = jsonResponse(success);
      if (value === null) response.headers.delete(header);
      else response.headers.set(header, value);
      return response;
    };
    check((await handler.handleBetaEvent(request(input))).status, 503, "untrusted response metadata rejected");
    check(sent.length, 1, "bad response is not retried");
  }
  for (const [status, code, retryable, expectedStatus] of [
    [400, "INVALID_EVENT", false, 422], [404, "TRACKING_DISABLED", false, 404],
    [405, "INVALID_EVENT", false, 422], [413, "PAYLOAD_TOO_LARGE", false, 413],
    [415, "UNSUPPORTED_MEDIA_TYPE", false, 415], [429, "RATE_LIMITED", true, 429],
    [503, "COLLECTOR_UNAVAILABLE", true, 503],
  ]) {
    sent = [];
    stubResponse = () => new Response(JSON.stringify({ ok: false, contract_version: version,
      error: { code, retryable, retry_after_ms: retryable ? 1000 : null } }), {
      status, headers: jsonResponse(success).headers,
    });
    const response = await handler.handleBetaEvent(request(input));
    check(response.status, expectedStatus, "safe non-2xx error envelope normalized");
    check((await response.json()).error.code, code, "safe server error code preserved");
  }
  stubResponse = () => new Response(JSON.stringify(success), { status: 503, headers: jsonResponse(success).headers });
  check((await handler.handleBetaEvent(request(input))).status, 503, "ok body cannot bypass failed HTTP status");
  const sharedIngress = loadTypeScript(resolve(root, "src/shared/api/cloudflare-ingress/index.ts"));
  const bridgeIp = loadTypeScript(resolve(root, "src/features/shinhan-bridge/api/client-ip.server.ts"));
  for (const [raw, expected] of [
    ["192.0.2.10", "v4:192.0.2.10"], [" 192.0.2.10 ", "v4:192.0.2.10"],
    ["2001:0db8:0000:0000:0000:0000:0000:0001", "v6:2001:db8::1"],
    ["::ffff:192.0.2.10", "v4:192.0.2.10"], ["::1", "v6:::1"],
  ]) {
    check(sharedIngress.normalizeClientIp(raw), expected, "shared normalization preserves existing IP semantics");
    check(bridgeIp.normalizeClientIp(raw), expected, "existing bridge normalization preserved");
  }
  const cfSecret = "b".repeat(64);
  const cfEnvironment = { ...production, SHINHAN_CLIENT_IP_MODE: "cloudflare-vercel",
    SHINHAN_CF_INGRESS_SECRET: cfSecret, BETA_TRACKING_ALLOWED_ORIGINS: "https://hometogether.kr" };
  const cfHeaders = { "x-shinhan-ingress-key": cfSecret, "x-shinhan-visitor-ip": "192.0.2.10" };
  for (const secret of ["", "B".repeat(64), production.BETA_EVENT_WRITE_SECRET]) {
    configure({ ...cfEnvironment, SHINHAN_CF_INGRESS_SECRET: secret });
    check(configuration.getBetaTrackingContext(), null, "CF key absent invalid or reused as event key disables tracking");
  }
  configure(cfEnvironment);
  check(configuration.getBetaTrackingContext() !== null, true, "valid CF production configuration");
  for (const overrides of [
    { "x-shinhan-ingress-key": null }, { "x-shinhan-ingress-key": "c".repeat(64) },
    { "x-shinhan-ingress-key": cfSecret + "," + cfSecret },
    { "x-shinhan-visitor-ip": null }, { "x-shinhan-visitor-ip": "invalid" },
    { "x-shinhan-visitor-ip": "192.0.2.10, 192.0.2.11" }, { "cf-worker": "" },
  ]) {
    const headers = new Headers(cfHeaders);
    for (const [name, value] of Object.entries(overrides)) {
      if (value === null) headers.delete(name); else headers.set(name, value);
    }
    assert.throws(() => bridgeIp.authenticateCloudflareClientIp(headers, cfEnvironment)); checks += 1;
    const incoming = request(input, Object.fromEntries(headers), "https://hometogether.kr/api/beta/events");
    sent = [];
    stubResponse = success;
    const response = await handler.handleBetaEvent(incoming);
    check(response.status, 503, "invalid CF ingress rejected");
    check((await response.json()).error.code, "INGRESS_UNAVAILABLE", "safe ingress error");
    check(incoming.bodyUsed, false, "CF rejection precedes body consumption");
    check(sent.length, 0, "CF rejection makes no collector request");
  }
  check(bridgeIp.authenticateCloudflareClientIp(new Headers(cfHeaders), cfEnvironment), "v4:192.0.2.10", "existing bridge CF behavior preserved");
  sent = [];
  stubResponse = success;
  check((await handler.handleBetaEvent(request(input, cfHeaders, "https://hometogether.kr/api/beta/events"))).status, 201, "valid CF ingress reaches collector");
  check(sent.length, 1, "valid CF request sends once without ingress proof or IP upstream");
  configure();

  configure({ BETA_TRACKING_ENABLED: "false" });
  sent = [];
  const disabled = await handler.handleBetaEvent(request(input));
  check(disabled.status, 404, "disabled BFF");
  check(sent.length, 0, "disabled no forwarding");
  console.log(
    "PASS: " +
      checks +
      " offline assertions; " +
      records.length +
      " synthetic ledger rows; no network.",
  );
  }
} finally {
  globalThis.fetch = originalFetch;
  for (const key of Object.keys(process.env))
    if (!(key in originalEnvironment)) delete process.env[key];
  Object.assign(process.env, originalEnvironment);
}

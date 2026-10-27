import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

// Synthetic and offline only: every browser dependency and fetch is supplied by this harness.
const root = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(resolve(root, "package.json"));
const ts = require("typescript");
const VERSION = "0.1.0-draft.3";
const DAY = 86_400_000;
const ANONYMOUS_KEY = "hometogether:marketing:anonymous-id";
const context = { context_id: "synthetic-browser-v3", completion_basis: "simulation" };
const STATE_KEY = "hometogether:beta-tracking:v3:" + context.context_id;
const UTM_KEY = "hometogether:marketing:external-attribution:v2";
const SOURCE_A = {
  utm_source: "apartment",
  utm_medium: "qr",
  utm_campaign: "host_acq_2026q4",
  utm_content: "ad_01",
};
const SOURCE_B = {
  utm_source: "everytime",
  utm_medium: "referral",
  utm_campaign: "guest_acq_2026q4",
  utm_content: "seoultech",
};
const EMPTY_SOURCE = { utm_source: "", utm_medium: "", utm_campaign: "", utm_content: "" };
let checks = 0;
const compiledSources = new Map();
async function settle() {
  for (let i = 0; i < 6; i++) await new Promise((resolve) => setImmediate(resolve));
}
function plain(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}
function check(actual, expected, label) {
  assert.deepEqual(plain(actual), plain(expected), label);
  checks += 1;
}
function verify(condition, label) {
  assert.ok(condition, label);
  checks += 1;
}
function makeOrigin() {
  const values = new Map();
  const queues = new Map();
  let nextId = 1;
  const origin = {
    now: Date.parse("2026-10-28T00:00:00.000Z"),
    values,
    requests: [],
    requestTimes: [],
    lockCalls: [],
    storage: {
      get length() {
        return values.size;
      },
      key(index) {
        return [...values.keys()][index] ?? null;
      },
      getItem(key) {
        return values.get(key) ?? null;
      },
      setItem(key, value) {
        values.set(key, String(value));
      },
      removeItem(key) {
        values.delete(key);
      },
    },
    locks: {
      request(name, optionsOrCallback, providedCallback) {
        origin.lockCalls.push(name);
        const callback = providedCallback ?? optionsOrCallback;
        if (providedCallback && optionsOrCallback.ifAvailable && queues.has(name)) {
          return Promise.resolve(callback(null));
        }
        const previous = queues.get(name) ?? Promise.resolve();
        const result = previous.catch(() => {}).then(() => callback({ name }));
        const tail = result.catch(() => {});
        queues.set(name, tail);
        void tail.finally(() => {
          if (queues.get(name) === tail) queues.delete(name);
        });
        return result;
      },
    },
    uuid() {
      return "00000000-0000-4000-8000-" + String(nextId++).padStart(12, "0");
    },
    advance(ms) {
      origin.now += ms;
    },
  };
  return origin;
}
function makeTab(origin, options = {}) {
  const modules = new Map();
  const timers = new Map();
  let timerId = 0;
  class FakeDate extends Date {
    constructor(...args) {
      super(...(args.length ? args : [origin.now]));
    }
    static now() {
      return origin.now;
    }
  }
  class FakeNavigation {
    constructor(type) {
      this.type = type;
    }
  }
  const location = new URL(
    "https://synthetic.example" + (options.pathname ?? "/shinhan") + (options.search ?? ""),
  );
  const listeners = new Map();
  const eventTarget = (scope) => ({
    addEventListener(name, callback) {
      const key = scope + ":" + name;
      if (!listeners.has(key)) listeners.set(key, new Set());
      listeners.get(key).add(callback);
    },
    removeEventListener(name, callback) {
      listeners.get(scope + ":" + name)?.delete(callback);
    },
  });
  const setTimeoutFake = (callback, delay = 0) => {
    const id = ++timerId;
    timers.set(id, { callback, at: origin.now + delay });
    return id;
  };
  const clearTimeoutFake = (id) => timers.delete(id);
  const tab = { origin, timers, listeners, response: null, networkError: false };
  const browserWindow = {
    ...eventTarget("window"),
    localStorage: options.storage ?? origin.storage,
    location,
    setTimeout: setTimeoutFake,
    clearTimeout: clearTimeoutFake,
  };
  const browserDocument = {
    ...eventTarget("document"),
    referrer: options.referrer ?? "",
    visibilityState: "visible",
  };
  const browserNavigator = options.noLocks ? {} : { locks: origin.locks, onLine: true };
  const fakeMath = Object.create(Math);
  fakeMath.random = () => 0;
  const sandbox = vm.createContext({
    window: browserWindow,
    document: browserDocument,
    navigator: browserNavigator,
    Math: fakeMath,
    crypto: { randomUUID: () => origin.uuid() },
    Date: FakeDate,
    URL,
    URLSearchParams,
    AbortController,
    Response,
    Request,
    TextEncoder,
    PerformanceNavigationTiming: FakeNavigation,
    performance: {
      getEntriesByType: () => [new FakeNavigation(options.navigationType ?? "navigate")],
    },
    setTimeout: setTimeoutFake,
    clearTimeout: clearTimeoutFake,
    console,
    fetch: async (url, init) => {
      check(String(url), "/api/beta/events", "Only the stub analytics endpoint is addressed");
      check(init.credentials, "omit", "No application credentials");
      check(init.cache, "no-store", "No event cache");
      check(init.redirect, "error", "No external redirect");
      check(init.headers, { "Content-Type": "application/json" }, "Minimal transport headers");
      const request = JSON.parse(init.body);
      origin.requests.push(request);
      origin.requestTimes.push(origin.now);
      if (tab.networkError) throw new Error("synthetic offline");
      if (typeof tab.response === "function") return tab.response(request, init);
      if (tab.response) return tab.response;
      return new Response(
        JSON.stringify({
          ok: true,
          contract_version: VERSION,
          data: {
            status: "accepted",
            request_event_id: request.event.event_id,
            event_id: request.event.event_id,
            received_at: new Date(origin.now).toISOString(),
            projection_state: "current",
          },
        }),
        { status: 201, headers: { "Content-Type": "application/json" } },
      );
    },
  });
  function loadTypeScript(filename) {
    const target = [filename, filename + ".ts", resolve(filename, "index.ts")].find(
      (candidate) => existsSync(candidate) && candidate.endsWith(".ts"),
    );
    assert.ok(target, "Missing source: " + filename);
    if (modules.has(target)) return modules.get(target).exports;
    const loadedModule = { exports: {} };
    modules.set(target, loadedModule);
    if (!compiledSources.has(target)) {
      const result = ts.transpileModule(readFileSync(target, "utf8"), {
        fileName: target,
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
        reportDiagnostics: true,
      });
      assert.deepEqual(result.diagnostics ?? [], [], "Syntax: " + target);
      compiledSources.set(target, result.outputText);
    }
    const localRequire = (name) => {
      if (name === "zod") return require("zod");
      if (name.startsWith("@/")) return loadTypeScript(resolve(root, "src", name.slice(2)));
      if (name.startsWith(".")) return loadTypeScript(resolve(dirname(target), name));
      throw new Error("Unexpected dependency in offline verification: " + name);
    };
    const execute = new vm.Script(
      "(function(require,module,exports){\n" + compiledSources.get(target) + "\n})",
      {
        filename: target,
      },
    ).runInContext(sandbox);
    execute(localRequire, loadedModule, loadedModule.exports);
    return loadedModule.exports;
  }
  Object.assign(tab, {
    window: browserWindow,
    document: browserDocument,
    navigator: browserNavigator,
    dispatch(scope, name, event = {}) {
      for (const callback of listeners.get(scope + ":" + name) ?? []) callback(event);
    },
    load: (relative) => loadTypeScript(resolve(root, relative)),
    snapshot: () => JSON.parse(origin.values.get(STATE_KEY) ?? "null"),
    attribution: () => JSON.parse(origin.values.get(UTM_KEY) ?? "null"),
    iso: () => new Date(origin.now).toISOString(),
    async advanceTimers(ms) {
      const end = origin.now + ms;
      let iterations = 0;
      while (true) {
        const next = [...timers.entries()]
          .filter(([, item]) => item.at <= end)
          .sort((a, b) => a[1].at - b[1].at)[0];
        if (!next) break;
        assert.ok(++iterations < 500, "Fake timer loop");
        origin.now = next[1].at;
        timers.delete(next[0]);
        next[1].callback();
        await settle();
      }
      origin.now = end;
      await settle();
    },
  });
  tab.state = tab.load("src/features/beta-tracking/model/browser-state.ts");
  tab.sources = tab.load("src/domains/marketing-attribution/browser.ts");
  tab.delivery = tab.load("src/features/beta-tracking/api/events.ts");
  tab.update = (operation, create = false) =>
    tab.state.updateBrowserTrackingState(context, operation, { create });
  tab.enter = () => tab.update((state) => tab.state.observeRootEntry(state, tab.iso()), true);
  tab.lease = (flow, entryOnMount = true) =>
    tab.update((state) => tab.state.captureFormLease(state, flow, entryOnMount, tab.iso()));
  tab.start = (flow, lease) =>
    tab.update((state) => tab.state.startBoundAttempt(state, flow, lease, tab.iso()));
  tab.observe = (flow, binding, observation) =>
    tab.update((state) =>
      tab.state.observeBoundResult(state, context, flow, binding, observation, tab.iso()),
    );
  return tab;
}
function events(tab) {
  return tab.snapshot()?.attempts.flatMap((attempt) => attempt.events) ?? [];
}
function eventId(stored) {
  return stored.event?.event_id ?? stored.event_id;
}
function count(tab, eventName) {
  return events(tab).filter(
    (stored) => (stored.event?.event_name ?? stored.event_name) === eventName,
  ).length;
}
async function acceptAll(tab) {
  await tab.update((state) => {
    for (const attempt of state.attempts)
      for (const stored of attempt.events) {
        tab.state.setEventDelivery(state, stored.event.event_id, "accepted");
      }
  });
}
async function started(tab, flow) {
  await tab.enter();
  const lease = await tab.lease(flow);
  const binding = await tab.start(flow, lease);
  verify(binding !== null, flow + " valid input creates a binding");
  return { lease, binding };
}
function utmSearch(source) {
  return "?" + new URLSearchParams(source).toString();
}
async function capture(origin, options) {
  const tab = makeTab(origin, options);
  await tab.sources.captureDocumentMarketingAttribution();
  return tab;
}

// Actual event creation and completion rules; defaults/render do not call startBoundAttempt.
for (const flow of ["HOST_ESTIMATE", "HOST_REGISTRATION", "GUEST_BUDGET", "GUEST_DEMAND"]) {
  const tab = makeTab(makeOrigin());
  await tab.enter();
  await tab.enter();
  const lease = await tab.lease(flow);
  await tab.lease(flow);
  check(count(tab, "landing_view"), 1, flow + " repeated entry/form observation is one entry");
  check(count(tab, "beta_mission_start"), 0, flow + " form rendering is not a start");
  const binding = await tab.start(flow, lease);
  const same = await tab.start(flow, lease);
  check(same, binding, flow + " repeated valid input reuses binding");
  check(count(tab, "beta_mission_start"), 1, flow + " first valid input starts once");
  const originalEntry = events(tab)[0].event;
  check(originalEntry.role, "unselected", "Claim does not rewrite the original entry");
  check(originalEntry.flow_id, "", "Original unselected flow remains immutable");
  await tab.observe(flow, binding, "result");
  check(
    count(tab, "beta_mission_complete"),
    flow.startsWith("HOST_") ? 1 : 0,
    flow + " result completion rule",
  );
  if (flow.startsWith("GUEST_")) {
    // No guide observation is sent for the empty state; only an actual card signals guide.
    await tab.observe(flow, binding, "result");
    check(count(tab, "beta_mission_complete"), 0, flow + " result and empty guide do not complete");
    await tab.observe(flow, binding, "guide");
    check(count(tab, "beta_mission_complete"), 1, flow + " result plus existing guide completes");
  }
  const beforeReplay = events(tab).map(({ event }) => event);
  await tab.observe(flow, binding, "result");
  await tab.observe(flow, binding, "guide");
  await tab.enter();
  await tab.start(flow, lease);
  check(
    events(tab).map(({ event }) => event),
    beforeReplay,
    flow + " same form/result/reload replay is unchanged",
  );
  const candidate = await tab.lease(flow);
  check(candidate.kind, "candidate", flow + " completed form reentry captures predecessor");
  check(count(tab, "landing_view"), 1, flow + " reentry alone creates no event");
  const successor = await tab.start(flow, candidate);
  verify(
    successor.attempt_id !== binding.attempt_id,
    flow + " new valid input after reentry starts successor",
  );
  check(
    [count(tab, "landing_view"), count(tab, "beta_mission_start")],
    [2, 2],
    flow + " successor entry and start together",
  );
  const newest = tab.snapshot().attempts.at(-1);
  check(
    [newest.result_seen, newest.guide_seen],
    [false, false],
    flow + " successor does not inherit observations",
  );
  await tab.observe(flow, binding, "result");
  await tab.observe(flow, binding, "guide");
  await tab.start(flow, lease);
  check(
    count(tab, "beta_mission_complete"),
    1,
    flow + " old form and old observer cannot complete successor",
  );
}

// Both completion observations are necessary, in either order.
{
  const tab = makeTab(makeOrigin());
  const { binding } = await started(tab, "GUEST_BUDGET");
  await tab.observe("GUEST_BUDGET", binding, "guide");
  check(count(tab, "beta_mission_complete"), 0, "Guide alone does not complete");
  await tab.observe("GUEST_DEMAND", binding, "result");
  check(count(tab, "beta_mission_complete"), 0, "Wrong-flow result does not complete");
  await tab.observe("GUEST_BUDGET", binding, "result");
  check(count(tab, "beta_mission_complete"), 1, "Same-flow result joins earlier guide");
}

// Shared Web Locks: same predecessor joins once, stale predecessor cannot create a third attempt.
{
  const origin = makeOrigin();
  const left = makeTab(origin);
  const right = makeTab(origin);
  const { lease: oldLease, binding: original } = await started(left, "HOST_REGISTRATION");
  await left.observe("HOST_REGISTRATION", original, "result");
  const [first, second, stale] = await Promise.all([
    left.lease("HOST_REGISTRATION"),
    right.lease("HOST_REGISTRATION"),
    left.lease("HOST_REGISTRATION"),
  ]);
  const [a, b] = await Promise.all([
    left.start("HOST_REGISTRATION", first),
    right.start("HOST_REGISTRATION", second),
  ]);
  check(a, b, "Concurrent predecessor candidates join the same successor");
  check(left.snapshot().attempts.length, 2, "Concurrent replay creates only one successor");
  await right.start("HOST_REGISTRATION", oldLease);
  await right.observe("HOST_REGISTRATION", original, "result");
  check(left.snapshot().attempts.at(-1).events.length, 2, "Old tab cannot complete successor");
  await left.observe("HOST_REGISTRATION", a, "result");
  check(
    await right.start("HOST_REGISTRATION", stale),
    null,
    "Stale predecessor cannot start a third attempt",
  );
  check(left.snapshot().attempts.length, 2, "No stale-candidate third attempt");
  verify(
    origin.lockCalls.every((name) => name === left.state.BETA_STATE_LOCK),
    "All lifecycle mutations use the shared lock",
  );
}
{
  const origin = makeOrigin();
  const left = makeTab(origin);
  const right = makeTab(origin);
  await left.enter();
  const [hostLease, guestLease] = await Promise.all([
    left.lease("HOST_ESTIMATE"),
    right.lease("GUEST_DEMAND"),
  ]);
  await Promise.all([
    left.start("HOST_ESTIMATE", hostLease),
    right.start("GUEST_DEMAND", guestLease),
  ]);
  check(
    [count(left, "landing_view"), count(left, "beta_mission_start")],
    [2, 2],
    "Different flows concurrently claiming initial entry have separate attempts",
  );
  check(
    new Set(left.snapshot().attempts.map((item) => item.attempt_id)).size,
    2,
    "Different flows have distinct attempt IDs",
  );
}

// 24 hours is analysis classification, not a lifecycle reset.
{
  const origin = makeOrigin();
  const tab = makeTab(origin);
  const { binding } = await started(tab, "GUEST_DEMAND");
  origin.advance(DAY);
  const resumed = makeTab(origin);
  await resumed.enter();
  const next = await resumed.start("GUEST_DEMAND", await resumed.lease("GUEST_DEMAND"));
  check(next, binding, "24-hour unfinished attempt resumes unchanged");
  check(
    [count(tab, "landing_view"), count(tab, "beta_mission_start")],
    [1, 1],
    "24-hour resume emits no additional entry/start",
  );
}

// Fixed 90-day state epoch and stale bindings; shared identity and unrelated stores survive.
{
  const origin = makeOrigin();
  const tab = makeTab(origin);
  const { lease, binding } = await started(tab, "HOST_ESTIMATE");
  await acceptAll(tab);
  const epoch = tab.snapshot().created_at;
  const anonymous = origin.values.get(ANONYMOUS_KEY);
  origin.values.set("synthetic:unrelated-customer-store", "preserve");
  origin.advance(90 * DAY - 1);
  await tab.update(() => undefined);
  check(tab.snapshot().created_at, epoch, "Reading state does not extend 90-day epoch");
  origin.advance(1);
  check(await tab.update(() => "should-not-run"), null, "Exactly 90 days expires state");
  check(origin.values.has(STATE_KEY), false, "Expired analytics state removed");
  check(
    origin.values.get(ANONYMOUS_KEY),
    anonymous,
    "Shared anonymous ID is not deleted or rotated",
  );
  check(
    origin.values.get("synthetic:unrelated-customer-store"),
    "preserve",
    "Unrelated customer store preserved",
  );
  const fresh = makeTab(origin);
  await fresh.enter();
  check(
    await fresh.start("HOST_ESTIMATE", lease),
    null,
    "Expired form lease cannot start in a new epoch",
  );
  await fresh.observe("HOST_ESTIMATE", binding, "result");
  check(
    [count(fresh, "beta_mission_start"), count(fresh, "beta_mission_complete")],
    [0, 0],
    "Expired result binding does not synthesize predecessors",
  );
}

// Seven-day queue boundary, immutable IDs, terminal predecessor propagation.
{
  const origin = makeOrigin();
  const tab = makeTab(origin);
  await tab.enter();
  const lease = await tab.lease("HOST_REGISTRATION");
  origin.advance(100);
  const binding = await tab.start("HOST_REGISTRATION", lease);
  const ids = events(tab).map(({ event }) => event.event_id);
  origin.advance(7 * DAY - 101);
  await tab.update(() => undefined);
  check(
    events(tab).map((item) => item.delivery),
    ["pending", "pending"],
    "Queue remains valid one millisecond before original expiry",
  );
  origin.advance(1);
  await tab.update(() => undefined);
  check(
    events(tab).map((item) => item.delivery),
    ["lost", "failed"],
    "Exactly seven days drops predecessor and dependent start",
  );
  check(events(tab).map(eventId), ids, "Expiry never reissues IDs");
  check(
    events(tab).every((stored) => !("event" in stored)),
    true,
    "Expired payloads are purged, leaving only terminal markers",
  );
  check(
    await tab.start("HOST_REGISTRATION", lease),
    null,
    "Expired predecessor prevents retry via a new event",
  );
  await tab.observe("HOST_REGISTRATION", binding, "result");
  check(count(tab, "beta_mission_complete"), 0, "Expired predecessor blocks completion");
  check(
    await tab.update((state) => tab.state.nextPendingEvent(state, new Set())),
    null,
    "Expired queue has no sendable event",
  );
}
{
  const tab = makeTab(makeOrigin());
  const { binding } = await started(tab, "HOST_ESTIMATE");
  await tab.observe("HOST_ESTIMATE", binding, "result");
  const eventIds = events(tab).map(({ event }) => event.event_id);
  await tab.update((state) => tab.state.setEventDelivery(state, eventIds[0], "failed"));
  check(
    events(tab).map((item) => item.delivery),
    ["failed", "failed", "failed"],
    "Permanent predecessor failure terminates dependents",
  );
  check(
    await tab.update((state) => tab.state.nextPendingEvent(state, new Set())),
    null,
    "Failed chain cannot send",
  );
}
{
  const tab = makeTab(makeOrigin());
  const { binding } = await started(tab, "HOST_ESTIMATE");
  await tab.observe("HOST_ESTIMATE", binding, "result");
  const initialEvents = events(tab).map(({ event }) => event);
  let next = await tab.update((state) => tab.state.nextPendingEvent(state, new Set()));
  check(next, initialEvents[0], "Queue starts at entry");
  await tab.update((state) => tab.state.setEventDelivery(state, next.event_id, "accepted"));
  next = await tab.update((state) => tab.state.nextPendingEvent(state, new Set()));
  check(next, initialEvents[1], "Queue releases start after accepted entry");
  await tab.update((state) => tab.state.replayPredecessors(state, next.event_id));
  check(
    await tab.update((state) => tab.state.nextPendingEvent(state, new Set())),
    initialEvents[0],
    "Missing predecessor replays exact original entry",
  );
  check(
    events(tab).map(({ event }) => event),
    initialEvents,
    "Retry preserves IDs, times, attribution and payload",
  );
  check(
    await tab.update((state) =>
      tab.state.nextPendingEvent(state, new Set([initialEvents[0].event_id])),
    ),
    null,
    "Exhausted predecessor blocks dependent sends",
  );
}
{
  const tab = makeTab(makeOrigin());
  await tab.enter();
  for (let i = 0; i < 11; i++) {
    const binding = await tab.start("HOST_ESTIMATE", await tab.lease("HOST_ESTIMATE"));
    if (binding) await tab.observe("HOST_ESTIMATE", binding, "result");
  }
  check(
    events(tab).filter((item) => item.delivery === "pending").length,
    30,
    "Queue is bounded to 30 pending records",
  );
  check(
    tab
      .snapshot()
      .attempts.at(-1)
      .events.map((item) => item.delivery),
    ["lost", "failed"],
    "Queue overflow drops the whole dependent chain",
  );
}

// Attribution is captured once per document; first/latest share an immutable 90-day epoch.
{
  const origin = makeOrigin();
  const first = await capture(origin, { search: utmSearch(SOURCE_A) });
  const firstEpoch = first.attribution().created_at;
  check(
    first.attribution(),
    { version: 2, created_at: firstEpoch, first: SOURCE_A, latest: SOURCE_A },
    "Initial external attribution captured",
  );
  origin.advance(DAY);
  const second = await capture(origin, {
    search: utmSearch(SOURCE_B),
    referrer: "https://external.example/post",
  });
  check(
    second.attribution(),
    { version: 2, created_at: firstEpoch, first: SOURCE_A, latest: SOURCE_B },
    "New external source changes only latest",
  );
  for (const options of [
    {},
    { search: utmSearch(SOURCE_A), referrer: "https://synthetic.example/shinhan" },
    { search: utmSearch(SOURCE_A), navigationType: "reload" },
    { search: utmSearch(SOURCE_A), navigationType: "back_forward" },
    { search: utmSearch(SOURCE_A) + "&utm_source=apartment" },
    { search: "?utm_source=unknown&utm_medium=unknown&utm_campaign=x&utm_content=y" },
  ]) {
    const tab = await capture(origin, options);
    check(
      tab.attribution().latest,
      SOURCE_B,
      "Direct/internal/reload/history/invalid attribution cannot overwrite latest",
    );
    check(tab.attribution().created_at, firstEpoch, "Revisit never extends source epoch");
  }
  await second.enter();
  const { binding } = await started(second, "GUEST_DEMAND");
  const attemptSource = events(second)[0].event;
  origin.advance(DAY);
  await capture(origin, { search: utmSearch(SOURCE_A) });
  await second.observe("GUEST_DEMAND", binding, "result");
  await second.observe("GUEST_DEMAND", binding, "guide");
  check(
    events(second).map(({ event }) => [event.utm_source, event.utm_content]),
    Array(3).fill([attemptSource.utm_source, attemptSource.utm_content]),
    "Attempt attribution remains its entry snapshot",
  );
  origin.now = firstEpoch + 90 * DAY - 1;
  await second.sources.cleanupMarketingAttribution();
  verify(origin.values.has(UTM_KEY), "Source survives one millisecond before fixed expiry");
  origin.advance(1);
  const direct = await capture(origin, {});
  check(direct.attribution(), null, "Exactly 90 days removes first and latest together");
  check(
    direct.sources.readMarketingAttributionSnapshot(),
    EMPTY_SOURCE,
    "Direct revisit cannot restore expired source",
  );
  const newExternal = await capture(origin, { search: utmSearch(SOURCE_B) });
  check(
    newExternal.attribution(),
    { version: 2, created_at: origin.now, first: SOURCE_B, latest: SOURCE_B },
    "Actual new external source starts a new attribution epoch",
  );
}
{
  const origin = makeOrigin();
  const tab = await capture(origin, { search: utmSearch(SOURCE_A) });
  await tab.enter();
  const rawBefore = JSON.stringify(tab.snapshot());
  await tab.lease("GUEST_DEMAND", false);
  check(
    JSON.stringify(tab.snapshot()),
    rawBefore,
    "Landing input lease alone preserves unselected entry",
  );
  check(count(tab, "beta_mission_start"), 0, "Landing adapters do not start on display");
  check(tab.state.STATE_MAX_AGE_MS, 90 * DAY, "Actual state TTL matches contract");
  check(tab.state.QUEUE_MAX_AGE_MS, 7 * DAY, "Actual queue TTL matches contract");
}

// Unsafe storage/lock conditions fail closed without substitute identities.
{
  const origin = makeOrigin();
  const noLocks = makeTab(origin, { noLocks: true });
  await assert.rejects(noLocks.enter(), /Web Locks unavailable/);
  checks += 1;
  check(origin.values.size, 0, "Missing Web Locks creates no identity or event");
  const unavailable = makeTab(origin, {
    storage: {
      length: 0,
      key: () => null,
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    },
  });
  await assert.rejects(unavailable.enter(), /Unavailable beta storage/);
  checks += 1;
  check(origin.values.size, 0, "Unstable storage creates no persisted event");
}

// Actual transport module with strict synthetic fetch: no real network can be reached.
{
  const origin = makeOrigin();
  const tab = makeTab(origin);
  await started(tab, "HOST_ESTIMATE");
  const input = { context_id: context.context_id, event: events(tab)[0].event };
  check(await tab.delivery.sendBetaEvent(input), { kind: "accepted" }, "Accepted 201 response");
  tab.response = (request) =>
    new Response(
      JSON.stringify({
        ok: true,
        contract_version: VERSION,
        data: {
          status: "duplicate",
          request_event_id: request.event.event_id,
          event_id: "00000000-0000-4000-8000-000000999999",
          received_at: new Date(origin.now).toISOString(),
          projection_state: "dirty",
        },
      }),
      { status: 200 },
    );
  check(
    await tab.delivery.sendBetaEvent(input),
    { kind: "accepted" },
    "Duplicate canonical event and dirty projection are accepted",
  );
  tab.response = () =>
    new Response(
      JSON.stringify({
        ok: false,
        contract_version: VERSION,
        error: { code: "MISSING_PREDECESSOR", retryable: true, retry_after_ms: 1000 },
      }),
      { status: 409 },
    );
  check(
    await tab.delivery.sendBetaEvent(input),
    { kind: "retry", retryAfterMs: 1000, missingPredecessor: true },
    "Missing predecessor response requests ordered retry",
  );
  tab.response = () =>
    new Response(
      JSON.stringify({
        ok: false,
        contract_version: VERSION,
        error: { code: "EVENT_ID_CONFLICT", retryable: false, retry_after_ms: null },
      }),
      { status: 409 },
    );
  check(
    await tab.delivery.sendBetaEvent(input),
    { kind: "permanent" },
    "Canonical conflict is terminal",
  );
  tab.networkError = true;
  check(
    await tab.delivery.sendBetaEvent(input),
    { kind: "retry", retryAfterMs: 0, missingPredecessor: false },
    "Network failure remains retryable",
  );
  check(
    origin.requests.every((request) => JSON.stringify(request) === JSON.stringify(plain(input))),
    true,
    "Every transport retry preserves the exact request",
  );
  check(tab.timers.size, 0, "Delivery timeout timers always cleaned up");
  const requestsBefore = origin.requests.length;
  check(
    await tab.delivery.sendBetaEvent({ ...input, phone: "SYNTHETIC_FORBIDDEN" }),
    { kind: "permanent" },
    "Additional private field rejected before transport",
  );
  check(origin.requests.length, requestsBefore, "Invalid payload sends nothing");
}

// Runtime bindings: only an existing save result promotes a form's analysis binding.
{
  const tab = makeTab(makeOrigin());
  const { createBetaBrowserTracker } = tab.load(
    "src/features/beta-tracking/model/browser-tracker.ts",
  );
  const tracker = createBetaBrowserTracker(context);
  await tracker.start();
  await settle();
  const form = tracker.createFormBinding("HOST_ESTIMATE");
  tracker.prepareFormBinding(form);
  await form.lease;
  check(tracker.captureResultBinding("HOST_ESTIMATE"), null, "Preparing form cannot bind a result");
  tracker.trackValidInput(form);
  check(
    tracker.captureResultBinding("HOST_ESTIMATE"),
    null,
    "Input without save cannot bind a result",
  );
  const inputBinding = await form.input;
  tab.document.visibilityState = "hidden";
  tracker.markResultReady(form);
  const saved = tracker.captureResultBinding("HOST_ESTIMATE");
  verify(saved !== null, "Save callback synchronously exposes in-flight binding");
  check(await saved.value, inputBinding, "Hidden-tab save preserves its exact form input binding");
  tracker.observeResult(saved, "result");
  await settle();
  check(count(tab, "beta_mission_complete"), 0, "Hidden result cannot complete an attempt");
  tab.document.visibilityState = "visible";
  tracker.observeResult(saved, "result");
  await settle();
  check(count(tab, "beta_mission_complete"), 1, "Runtime completes first observed saved result");
  tracker.trackValidInput(form);
  tracker.observeResult(saved, "result");
  await settle();
  check(
    [count(tab, "landing_view"), count(tab, "beta_mission_complete")],
    [1, 1],
    "Runtime same completed form input/result replay emits nothing",
  );

  const nextForm = tracker.createFormBinding("HOST_ESTIMATE");
  tracker.prepareFormBinding(nextForm);
  await nextForm.lease;
  tracker.trackValidInput(nextForm);
  const nextInput = await nextForm.input;
  verify(
    nextInput.attempt_id !== inputBinding.attempt_id,
    "Runtime form reentry plus valid input creates successor",
  );
  check(
    await tracker.captureResultBinding("HOST_ESTIMATE").value,
    inputBinding,
    "New input alone preserves previous saved result binding",
  );
  tracker.observeResult(saved, "result");
  await settle();
  check(
    tab.snapshot().attempts.at(-1).events.length,
    2,
    "Frozen old result cannot complete new input",
  );
  tracker.markResultReady(nextForm);
  check(
    await tracker.captureResultBinding("HOST_ESTIMATE").value,
    nextInput,
    "Only save callback promotes new result binding",
  );
  check(await saved.value, inputBinding, "Previously mounted result keeps its old binding");
  tracker.observeResult(tracker.captureResultBinding("HOST_ESTIMATE"), "result");
  await settle();
  check(count(tab, "beta_mission_complete"), 2, "New saved result completes only successor");

  const candidate = tracker.createFormBinding("HOST_ESTIMATE");
  tracker.prepareFormBinding(candidate);
  await candidate.lease;
  tracker.markResultReady(candidate);
  const unsavedCandidate = tracker.captureResultBinding("HOST_ESTIMATE");
  const candidateValue = unsavedCandidate ? await unsavedCandidate.value : null;
  check(
    candidateValue,
    null,
    "Completed predecessor candidate without valid input cannot promote a new result",
  );
  tracker.observeResult(unsavedCandidate, "result");
  await settle();
  check(
    tab.snapshot().attempts.length,
    2,
    "Candidate save signal alone cannot synthesize another attempt",
  );
  tracker.stop();
  await settle();
  check(tab.timers.size, 0, "Runtime stop clears timers");
  check(
    [...tab.listeners.values()].reduce((total, set) => total + set.size, 0),
    0,
    "Runtime stop removes listeners",
  );
}

// A started unfinished form can save on revisit without requiring another artificial input.
{
  const origin = makeOrigin();
  const prior = makeTab(origin);
  const { binding } = await started(prior, "HOST_REGISTRATION");
  await acceptAll(prior);
  const tab = makeTab(origin);
  const { createBetaBrowserTracker } = tab.load(
    "src/features/beta-tracking/model/browser-tracker.ts",
  );
  const tracker = createBetaBrowserTracker(context);
  await tracker.start();
  const resumed = tracker.createFormBinding("HOST_REGISTRATION");
  tracker.prepareFormBinding(resumed);
  await resumed.lease;
  tracker.markResultReady(resumed);
  const saved = tracker.captureResultBinding("HOST_REGISTRATION");
  check(await saved.value, binding, "Prepared started bound form can promote its existing binding");
  tracker.observeResult(saved, "result");
  await settle();
  check(
    [count(tab, "beta_mission_start"), count(tab, "beta_mission_complete")],
    [1, 1],
    "Resume result does not fabricate a second start",
  );
  tracker.stop();
}

// Actual worker executes at most five immutable retries per round, then waits for a new trigger.
{
  const origin = makeOrigin();
  const tab = makeTab(origin);
  tab.networkError = true;
  const { createBetaBrowserTracker } = tab.load(
    "src/features/beta-tracking/model/browser-tracker.ts",
  );
  const tracker = createBetaBrowserTracker(context);
  const beginning = origin.now;
  await tracker.start();
  await settle();
  check(origin.requests.length, 1, "Worker first attempt is immediate");
  await tab.advanceTimers(45_000);
  check(origin.requests.length, 5, "Worker stops after five attempts in one round");
  check(
    origin.requestTimes.map((time) => time - beginning),
    [0, 1_000, 4_000, 14_000, 44_000],
    "Actual delays follow 0/1/3/10/30 seconds with deterministic zero jitter",
  );
  check(
    new Set(origin.requests.map((request) => JSON.stringify(request))).size,
    1,
    "All worker retries preserve the exact event",
  );
  const firstOccurredAt = events(tab)[0].event.occurred_at;
  tab.dispatch("window", "online");
  await settle();
  await tab.advanceTimers(45_000);
  check(origin.requests.length, 10, "Online starts one additional bounded retry round");
  check(
    events(tab)[0].event.occurred_at,
    firstOccurredAt,
    "Online retry does not extend first occurrence TTL",
  );
  origin.now = Date.parse(firstOccurredAt) + 7 * DAY;
  tab.dispatch("window", "online");
  await settle();
  check(origin.requests.length, 10, "Exactly seven days prevents another transport retry");
  check(events(tab)[0].delivery, "lost", "Worker terminally drops expired queued event");
  check("event" in events(tab)[0], false, "Worker expiry removes queued payload");
  tracker.stop();
}

// Missing-predecessor recovery uses the original accepted predecessor, without fresh IDs.
{
  const tab = makeTab(makeOrigin());
  let rejectedStart = false;
  tab.response = (request) => {
    if (request.event.event_name === "beta_mission_start" && !rejectedStart) {
      rejectedStart = true;
      return new Response(
        JSON.stringify({
          ok: false,
          contract_version: VERSION,
          error: { code: "MISSING_PREDECESSOR", retryable: true, retry_after_ms: 0 },
        }),
        { status: 409 },
      );
    }
    return new Response(
      JSON.stringify({
        ok: true,
        contract_version: VERSION,
        data: {
          status: "accepted",
          request_event_id: request.event.event_id,
          event_id: request.event.event_id,
          received_at: tab.iso(),
          projection_state: "current",
        },
      }),
      { status: 201 },
    );
  };
  const { createBetaBrowserTracker } = tab.load(
    "src/features/beta-tracking/model/browser-tracker.ts",
  );
  const tracker = createBetaBrowserTracker(context);
  await tracker.start();
  await settle();
  const form = tracker.createFormBinding("HOST_REGISTRATION");
  tracker.prepareFormBinding(form);
  await form.lease;
  tracker.trackValidInput(form);
  await form.input;
  await settle();
  await tab.advanceTimers(5_000);
  check(
    tab.origin.requests.map((request) => request.event.event_name),
    ["landing_view", "beta_mission_start", "landing_view", "beta_mission_start"],
    "Worker recovers missing predecessor in order",
  );
  check(
    tab.origin.requests[0],
    tab.origin.requests[2],
    "Worker predecessor replay is byte-equivalent input",
  );
  check(
    tab.origin.requests[1],
    tab.origin.requests[3],
    "Worker start replay is byte-equivalent input",
  );
  check(
    events(tab).map((stored) => stored.delivery),
    ["accepted", "accepted"],
    "Worker recovery accepts original chain",
  );
  tracker.stop();
}

// Disabled browser capabilities and development example paths stay harmless at runtime.
for (const options of [{ noLocks: true }, { pathname: "/shinhan/dev/host/followup" }]) {
  const tab = makeTab(makeOrigin(), options);
  const { createBetaBrowserTracker } = tab.load(
    "src/features/beta-tracking/model/browser-tracker.ts",
  );
  const tracker = createBetaBrowserTracker(context);
  await tracker.start();
  const form = tracker.createFormBinding("HOST_ESTIMATE");
  tracker.prepareFormBinding(form);
  tracker.trackValidInput(form);
  tracker.markResultReady(form);
  tracker.observeResult(tracker.captureResultBinding("HOST_ESTIMATE"), "result");
  await settle();
  check(tab.origin.requests.length, 0, "Unavailable locks/dev examples produce no transport");
  check(tab.snapshot(), null, "Unavailable locks/dev examples produce no analysis state");
  tracker.stop();
}

console.log("PASS: " + checks + " synthetic offline browser assertions; no network.");
console.log(
  "Scope: actual lifecycle, storage/locks, TTL, queue, attribution, transport and runtime retry modules.",
);
console.log(
  "DOM visibility, empty guide rendering and input-default behavior require the separate UI check.",
);

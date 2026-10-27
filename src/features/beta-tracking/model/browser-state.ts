import { z } from "zod";

import {
  BETA_FLOW_IDS,
  BETA_SCHEMA_VERSION,
  betaContextIdSchema,
  type BetaEventInput,
  betaEventInputSchema,
  type BetaFlowId,
  betaTimestampSchema,
  type BetaTrackingContext,
  betaUuidSchema,
} from "@/domains/beta-tracking";
import {
  type MarketingAttributionSnapshot,
  readMarketingAttributionSnapshot,
} from "@/domains/marketing-attribution/browser";

export const BETA_STATE_LOCK = "hometogether:beta-tracking:state";
export const BETA_STORAGE_PREFIX = "hometogether:beta-tracking:v3:";
export const STATE_MAX_AGE_MS = 7_776_000_000;
export const QUEUE_MAX_AGE_MS = 604_800_000;
const ANONYMOUS_ID_KEY = "hometogether:marketing:anonymous-id";
const PHASES = ["landing_view", "beta_mission_start", "beta_mission_complete"] as const;

const storedEventSchema = z.union([
  z.strictObject({ event: betaEventInputSchema, delivery: z.enum(["pending", "accepted"]) }),
  z.strictObject({
    event_id: betaUuidSchema,
    event_name: z.enum(PHASES),
    delivery: z.enum(["failed", "lost"]),
  }),
]);
const attemptSchema = z.strictObject({
  attempt_id: betaUuidSchema,
  predecessor_id: betaUuidSchema.nullable(),
  flow_id: z.enum(["", ...BETA_FLOW_IDS]),
  result_seen: z.boolean(),
  guide_seen: z.boolean(),
  events: z.array(storedEventSchema).min(1).max(3),
});
const browserStateSchema = z.strictObject({
  version: z.literal(3),
  context_id: betaContextIdSchema,
  created_at: betaTimestampSchema,
  anonymous_id: betaUuidSchema,
  initial_attempt_id: betaUuidSchema.nullable(),
  attempts: z.array(attemptSchema),
});

export type BrowserTrackingState = z.infer<typeof browserStateSchema>;
type BrowserAttempt = z.infer<typeof attemptSchema>;
export type StoredBetaEvent = z.infer<typeof storedEventSchema>;
export interface FormLease {
  epoch: string;
  kind: "bound" | "candidate" | "new";
  attempt_id: string | null;
}
export interface ResultBinding {
  epoch: string;
  attempt_id: string;
}

function assertStateConsistency(state: BrowserTrackingState, context: BetaTrackingContext) {
  const attemptIds = new Set<string>();
  const eventIds = new Set<string>();
  if (state.context_id !== context.context_id) throw new Error("Invalid beta context");
  for (const attempt of state.attempts) {
    if (attemptIds.has(attempt.attempt_id)) throw new Error("Invalid beta attempt");
    attemptIds.add(attempt.attempt_id);
    const first = attempt.events[0];
    const entry = "event" in first ? first.event : null;
    const attribution = entry && [
      entry.utm_source,
      entry.utm_medium,
      entry.utm_campaign,
      entry.utm_content,
    ];
    attempt.events.forEach((stored, index) => {
      if (!("event" in stored)) {
        if (eventIds.has(stored.event_id) || stored.event_name !== PHASES[index]) {
          throw new Error("Invalid beta terminal state");
        }
        eventIds.add(stored.event_id);
        return;
      }
      const { event } = stored;
      if (
        eventIds.has(event.event_id) ||
        event.attempt_id !== attempt.attempt_id ||
        event.anonymous_id !== state.anonymous_id ||
        event.event_name !== PHASES[index] ||
        (event.flow_id !== "" && event.flow_id !== attempt.flow_id) ||
        (index > 0 && event.flow_id !== attempt.flow_id) ||
        (index === 2 && event.completion_basis !== context.completion_basis) ||
        (attribution &&
          [event.utm_source, event.utm_medium, event.utm_campaign, event.utm_content].some(
            (value, field) => value !== attribution[field],
          ))
      ) {
        throw new Error("Invalid beta event state");
      }
      eventIds.add(event.event_id);
    });
  }
}

function cleanupExpiredStates(): number | null {
  let nextExpiry: number | null = null;
  const keys = Array.from({ length: window.localStorage.length }, (_, index) =>
    window.localStorage.key(index),
  );
  for (const key of keys) {
    if (!key?.startsWith(BETA_STORAGE_PREFIX)) continue;
    const raw = window.localStorage.getItem(key);
    if (raw === null) continue;
    let input: unknown;
    try {
      input = JSON.parse(raw) as unknown;
    } catch {
      continue;
    }
    const parsed = browserStateSchema.safeParse(input);
    if (!parsed.success) continue;
    const state = parsed.data;
    const stateExpiry = Date.parse(state.created_at) + STATE_MAX_AGE_MS;
    if (Date.now() >= stateExpiry) {
      window.localStorage.removeItem(key);
      continue;
    }
    expireQueue(state);
    const serialized = JSON.stringify(state);
    if (serialized !== raw) window.localStorage.setItem(key, serialized);
    let expiry = stateExpiry;
    for (const attempt of state.attempts) {
      for (const stored of attempt.events) {
        if (stored.delivery === "pending")
          expiry = Math.min(expiry, Date.parse(stored.event.occurred_at) + QUEUE_MAX_AGE_MS);
      }
    }
    nextExpiry = nextExpiry === null ? expiry : Math.min(nextExpiry, expiry);
  }
  return nextExpiry;
}

export async function cleanupBrowserTrackingStates(): Promise<number | null> {
  if (typeof navigator.locks?.request !== "function") return null;
  return navigator.locks.request(BETA_STATE_LOCK, cleanupExpiredStates);
}

function readState(context: BetaTrackingContext, create: boolean): BrowserTrackingState | null {
  cleanupExpiredStates();
  const key = BETA_STORAGE_PREFIX + context.context_id;
  const raw = window.localStorage.getItem(key);
  let state = raw === null ? null : browserStateSchema.parse(JSON.parse(raw) as unknown);
  if (state && Date.now() >= Date.parse(state.created_at) + STATE_MAX_AGE_MS) {
    window.localStorage.removeItem(key);
    state = null;
  }
  if (!state && !create) return null;
  const rawId = window.localStorage.getItem(ANONYMOUS_ID_KEY);
  if (state && rawId === null) throw new Error("Changed beta identity");
  const anonymousId = rawId === null ? crypto.randomUUID() : betaUuidSchema.parse(rawId);
  if (state && state.anonymous_id !== anonymousId) throw new Error("Changed beta identity");
  if (rawId === null) {
    window.localStorage.setItem(ANONYMOUS_ID_KEY, anonymousId);
    if (window.localStorage.getItem(ANONYMOUS_ID_KEY) !== anonymousId) {
      throw new Error("Unavailable beta storage");
    }
  }
  state ??= {
    version: 3,
    context_id: context.context_id,
    created_at: new Date().toISOString(),
    anonymous_id: anonymousId,
    initial_attempt_id: null,
    attempts: [],
  };
  assertStateConsistency(state, context);
  return state;
}

function terminalEvent(stored: StoredBetaEvent, delivery: "failed" | "lost"): StoredBetaEvent {
  return {
    event_id: "event" in stored ? stored.event.event_id : stored.event_id,
    event_name: "event" in stored ? stored.event.event_name : stored.event_name,
    delivery,
  };
}

function expireQueue(state: BrowserTrackingState) {
  let count = 0;
  for (const attempt of state.attempts) {
    let blocked = false;
    attempt.events = attempt.events.map((stored) => {
      if (stored.delivery === "pending") {
        if (blocked) stored = terminalEvent(stored, "failed");
        else if (
          Date.now() >= Date.parse(stored.event.occurred_at) + QUEUE_MAX_AGE_MS ||
          ++count > 30
        )
          stored = terminalEvent(stored, "lost");
      }
      blocked ||= stored.delivery === "failed" || stored.delivery === "lost";
      return stored;
    });
  }
}

/** A shared origin lock covers UUID creation, state re-read and immutable event assignment. */
export async function updateBrowserTrackingState<T>(
  context: BetaTrackingContext,
  update: (state: BrowserTrackingState) => T,
  options: { create?: boolean } = {},
): Promise<T | null> {
  if (typeof navigator.locks?.request !== "function") throw new Error("Web Locks unavailable");
  return navigator.locks.request(BETA_STATE_LOCK, () => {
    const state = readState(context, options.create ?? false);
    if (!state) return null;
    expireQueue(state);
    const result = update(state);
    expireQueue(state);
    assertStateConsistency(state, context);
    const key = BETA_STORAGE_PREFIX + context.context_id;
    const serialized = JSON.stringify(state);
    window.localStorage.setItem(key, serialized);
    if (window.localStorage.getItem(key) !== serialized)
      throw new Error("Unavailable beta storage");
    return result;
  });
}

function snapshotOf(attempt: BrowserAttempt): MarketingAttributionSnapshot {
  const first = attempt.events[0];
  if (!("event" in first)) throw new Error("Terminal beta entry");
  const entry = first.event;
  return {
    utm_source: entry.utm_source,
    utm_medium: entry.utm_medium,
    utm_campaign: entry.utm_campaign,
    utm_content: entry.utm_content,
  };
}

function createEvent(
  state: BrowserTrackingState,
  attemptId: string,
  flow: BetaFlowId | "",
  name: BetaEventInput["event_name"],
  attribution: MarketingAttributionSnapshot,
  observedAt: string,
  basis: BetaEventInput["completion_basis"] = "",
): StoredBetaEvent {
  return {
    event: {
      schema_version: BETA_SCHEMA_VERSION,
      event_id: crypto.randomUUID(),
      attempt_id: attemptId,
      anonymous_id: state.anonymous_id,
      event_name: name,
      role: flow === "" ? "unselected" : flow.startsWith("HOST_") ? "host" : "guest",
      occurred_at: observedAt,
      ...attribution,
      flow_id: flow,
      completion_basis: basis,
    },
    delivery: "pending",
  };
}

function createAttempt(
  state: BrowserTrackingState,
  flow: BetaFlowId | "",
  observedAt: string,
  predecessorId: string | null = null,
) {
  const attemptId = crypto.randomUUID();
  const attempt: BrowserAttempt = {
    attempt_id: attemptId,
    predecessor_id: predecessorId,
    flow_id: flow,
    result_seen: false,
    guide_seen: false,
    events: [
      createEvent(
        state,
        attemptId,
        flow,
        "landing_view",
        readMarketingAttributionSnapshot(),
        observedAt,
      ),
    ],
  };
  state.attempts.push(attempt);
  return attempt;
}

export function observeRootEntry(state: BrowserTrackingState, observedAt: string) {
  if (state.initial_attempt_id !== null) return;
  const attempt = createAttempt(state, "", observedAt);
  state.initial_attempt_id = attempt.attempt_id;
}

function currentAttempt(state: BrowserTrackingState, flow: BetaFlowId) {
  return state.attempts.findLast((attempt) => attempt.flow_id === flow);
}
function isCompleted(attempt: BrowserAttempt) {
  return attempt.events.length === 3;
}
function isTerminal(attempt: BrowserAttempt) {
  return attempt.events.some(({ delivery }) => delivery === "failed" || delivery === "lost");
}
function initialUnselectedAttempt(state: BrowserTrackingState) {
  return state.attempts.find(
    (attempt) => attempt.attempt_id === state.initial_attempt_id && attempt.flow_id === "",
  );
}

export function captureFormLease(
  state: BrowserTrackingState,
  flow: BetaFlowId,
  entryOnMount: boolean,
  observedAt: string,
): FormLease {
  const current = currentAttempt(state, flow);
  if (current) {
    return {
      epoch: state.created_at,
      kind: isCompleted(current) ? "candidate" : "bound",
      attempt_id: current.attempt_id,
    };
  }
  const initial = initialUnselectedAttempt(state);
  if (initial) return { epoch: state.created_at, kind: "bound", attempt_id: initial.attempt_id };
  if (!entryOnMount) return { epoch: state.created_at, kind: "new", attempt_id: null };
  const attempt = createAttempt(state, flow, observedAt);
  return { epoch: state.created_at, kind: "bound", attempt_id: attempt.attempt_id };
}

export function capturedResumeBinding(
  state: BrowserTrackingState,
  flow: BetaFlowId,
  lease: FormLease,
): ResultBinding | null {
  if (lease.kind !== "bound" || lease.epoch !== state.created_at) return null;
  const attempt = state.attempts.find((item) => item.attempt_id === lease.attempt_id);
  return attempt && attempt.flow_id === flow && attempt.events.length >= 2 && !isTerminal(attempt)
    ? { epoch: state.created_at, attempt_id: attempt.attempt_id }
    : null;
}

function resolveInputAttempt(
  state: BrowserTrackingState,
  flow: BetaFlowId,
  lease: FormLease,
  observedAt: string,
) {
  if (state.created_at !== lease.epoch) return null;
  const current = currentAttempt(state, flow);
  if (lease.kind === "candidate") {
    if (current?.attempt_id === lease.attempt_id && isCompleted(current)) {
      return createAttempt(state, flow, observedAt, current.attempt_id);
    }
    if (current?.predecessor_id === lease.attempt_id && !isCompleted(current)) return current;
    return null;
  }
  if (lease.kind === "bound") {
    const bound = state.attempts.find((attempt) => attempt.attempt_id === lease.attempt_id);
    if (!bound) return null;
    if (bound.flow_id === flow || bound.flow_id === "") return bound;
    // Two different flows may compete to claim the same initial unselected entry.
    if (bound.attempt_id !== state.initial_attempt_id) return null;
  }
  if (current) return isCompleted(current) ? null : current;
  return initialUnselectedAttempt(state) ?? createAttempt(state, flow, observedAt);
}

export function startBoundAttempt(
  state: BrowserTrackingState,
  flow: BetaFlowId,
  lease: FormLease,
  observedAt: string,
): ResultBinding | null {
  const attempt = resolveInputAttempt(state, flow, lease, observedAt);
  if (!attempt || isTerminal(attempt)) return null;
  if (attempt.events.length === 1) {
    attempt.flow_id = flow;
    attempt.events.push(
      createEvent(
        state,
        attempt.attempt_id,
        flow,
        "beta_mission_start",
        snapshotOf(attempt),
        observedAt,
      ),
    );
  }
  return { epoch: state.created_at, attempt_id: attempt.attempt_id };
}

export function observeBoundResult(
  state: BrowserTrackingState,
  context: BetaTrackingContext,
  flow: BetaFlowId,
  binding: ResultBinding,
  observation: "result" | "guide",
  observedAt: string,
) {
  if (binding.epoch !== state.created_at) return;
  const attempt = state.attempts.find((item) => item.attempt_id === binding.attempt_id);
  if (!attempt || attempt.flow_id !== flow || attempt.events.length < 2 || isTerminal(attempt))
    return;
  if (observation === "result") attempt.result_seen = true;
  if (observation === "guide") attempt.guide_seen = true;
  if (
    attempt.result_seen &&
    (flow.startsWith("HOST_") || attempt.guide_seen) &&
    attempt.events.length === 2
  ) {
    attempt.events.push(
      createEvent(
        state,
        attempt.attempt_id,
        flow,
        "beta_mission_complete",
        snapshotOf(attempt),
        observedAt,
        context.completion_basis,
      ),
    );
  }
}

export function nextPendingEvent(state: BrowserTrackingState, exhausted: ReadonlySet<string>) {
  for (const attempt of state.attempts) {
    const pending = attempt.events.find(({ delivery }) => delivery !== "accepted");
    if (pending?.delivery === "pending" && !exhausted.has(pending.event.event_id))
      return pending.event;
  }
  return null;
}

export function setEventDelivery(
  state: BrowserTrackingState,
  eventId: string,
  delivery: StoredBetaEvent["delivery"],
) {
  for (const attempt of state.attempts) {
    attempt.events = attempt.events.map((stored) => {
      if (stored.delivery !== "pending" || stored.event.event_id !== eventId) return stored;
      return delivery === "failed" || delivery === "lost"
        ? terminalEvent(stored, delivery)
        : { event: stored.event, delivery };
    });
  }
}

export function replayPredecessors(state: BrowserTrackingState, eventId: string) {
  for (const attempt of state.attempts) {
    const index = attempt.events.findIndex(
      (stored) => ("event" in stored ? stored.event.event_id : stored.event_id) === eventId,
    );
    if (index < 0) continue;
    attempt.events = attempt.events.map((stored, position) => {
      if (position >= index || stored.delivery !== "accepted") return stored;
      return Date.now() >= Date.parse(stored.event.occurred_at) + QUEUE_MAX_AGE_MS
        ? terminalEvent(stored, "lost")
        : { event: stored.event, delivery: "pending" };
    });
  }
}

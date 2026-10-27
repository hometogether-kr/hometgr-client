import {
  type BetaFlowId,
  type BetaTrackingContext,
  betaTrackingContextSchema,
} from "@/domains/beta-tracking";
import { captureDocumentMarketingAttribution } from "@/domains/marketing-attribution/browser";

import { sendBetaEvent } from "../api/events";
import {
  BETA_STORAGE_PREFIX,
  capturedResumeBinding,
  captureFormLease,
  cleanupBrowserTrackingStates,
  type FormLease,
  nextPendingEvent,
  observeBoundResult,
  observeRootEntry,
  replayPredecessors,
  type ResultBinding,
  setEventDelivery,
  startBoundAttempt,
  updateBrowserTrackingState,
} from "./browser-state";

export interface FormBinding {
  flow: BetaFlowId;
  entryOnMount: boolean;
  lease: Promise<FormLease | null> | null;
  input: Promise<ResultBinding | null> | null;
  resume: Promise<ResultBinding | null> | null;
}
export interface ResultObservationBinding {
  flow: BetaFlowId;
  value: Promise<ResultBinding | null>;
}
const RETRY_DELAYS_MS = [0, 1_000, 3_000, 10_000, 30_000] as const;

export function isTrackingPath(pathname: string) {
  return (
    (pathname === "/shinhan" || pathname.startsWith("/shinhan/")) &&
    pathname !== "/shinhan/dev" &&
    !pathname.startsWith("/shinhan/dev/")
  );
}

/** One instance belongs to a provider/document; form/result leases never come from shared storage. */
export function createBetaBrowserTracker(rawContext: BetaTrackingContext) {
  const context = betaTrackingContextSchema.parse(rawContext);
  let active = false;
  let failed = false;
  let initialized: Promise<void> | null = null;
  let operationTail: Promise<unknown> = Promise.resolve();
  let worker: Promise<void> | null = null;
  let requested = false;
  let cancelWait: (() => void) | null = null;
  let retentionTimer: number | undefined;
  let retentionRevision = 0;
  const lastSavedResults = new Map<BetaFlowId, Promise<ResultBinding | null>>();
  const sentThisRound = new Map<string, number>();
  const retryAfter = new Map<string, number>();
  const exhausted = new Set<string>();

  const canObserve = () =>
    active &&
    !failed &&
    document.visibilityState === "visible" &&
    isTrackingPath(window.location.pathname);

  function disable() {
    failed = true;
    retentionRevision += 1;
    window.clearTimeout(retentionTimer);
    cancelWait?.();
  }

  function run<T>(operation: () => Promise<T>): Promise<T | null> {
    const pending = operationTail
      .then(async () => (failed ? null : operation()))
      .catch(() => {
        disable();
        return null;
      });
    operationTail = pending;
    return pending;
  }

  function initialize() {
    initialized ??= (async () => {
      await captureDocumentMarketingAttribution();
      await updateBrowserTrackingState(
        context,
        (state) => {
          observeRootEntry(state, new Date().toISOString());
        },
        { create: true },
      );
    })();
    return initialized;
  }

  async function scheduleRetentionCleanup() {
    const revision = ++retentionRevision;
    window.clearTimeout(retentionTimer);
    const expiresAt = await cleanupBrowserTrackingStates();
    if (revision === retentionRevision && active && !failed && expiresAt !== null) {
      retentionTimer = window.setTimeout(
        () => {
          void scheduleRetentionCleanup().then(flush).catch(disable);
        },
        Math.min(Math.max(expiresAt - Date.now(), 1), 2_147_483_647),
      );
    }
  }

  function wait(delay: number): Promise<boolean> {
    if (!active || failed) return Promise.resolve(false);
    if (delay === 0) return Promise.resolve(true);
    return new Promise((resolve) => {
      const timer = window.setTimeout(() => {
        cancelWait = null;
        resolve(active && !failed);
      }, delay);
      cancelWait = () => {
        window.clearTimeout(timer);
        cancelWait = null;
        resolve(false);
      };
    });
  }

  async function flushRound() {
    await navigator.locks.request(
      BETA_STORAGE_PREFIX + "delivery:" + context.context_id,
      { ifAvailable: true },
      async (lock) => {
        if (!lock) return;
        while (active && !failed && navigator.onLine !== false) {
          const event = await updateBrowserTrackingState(context, (state) =>
            nextPendingEvent(state, exhausted),
          );
          if (!event) return;
          const count = sentThisRound.get(event.event_id) ?? 0;
          if (count >= RETRY_DELAYS_MS.length) {
            exhausted.add(event.event_id);
            continue;
          }
          const delay = Math.max(RETRY_DELAYS_MS[count], retryAfter.get(event.event_id) ?? 0);
          if (!(await wait(delay + (count > 0 ? Math.floor(Math.random() * 250) : 0)))) return;
          // Expiry or another tab's permanent failure may have ended this event during the delay.
          const current = await updateBrowserTrackingState(context, (state) =>
            nextPendingEvent(state, exhausted),
          );
          if (!current || current.event_id !== event.event_id) continue;
          sentThisRound.set(event.event_id, count + 1);
          const outcome = await sendBetaEvent({ context_id: context.context_id, event });
          await updateBrowserTrackingState(context, (state) => {
            if (outcome.kind === "accepted") setEventDelivery(state, event.event_id, "accepted");
            else if (outcome.kind === "permanent")
              setEventDelivery(state, event.event_id, "failed");
            else if (outcome.missingPredecessor) replayPredecessors(state, event.event_id);
          });
          if (outcome.kind === "retry") retryAfter.set(event.event_id, outcome.retryAfterMs);
        }
      },
    );
  }

  function flush() {
    requested = true;
    if (worker || !active || failed || navigator.onLine === false) return;
    requested = false;
    worker = flushRound()
      .catch(disable)
      .finally(() => {
        worker = null;
        if (requested && active && !failed) flush();
      });
  }

  function onOnline() {
    sentThisRound.clear();
    retryAfter.clear();
    exhausted.clear();
    flush();
  }
  function onStorage(event: StorageEvent) {
    if (event.key?.startsWith(BETA_STORAGE_PREFIX)) {
      flush();
      void scheduleRetentionCleanup().catch(disable);
    }
  }
  function onVisible() {
    if (!canObserve()) return;
    void initialize()
      .then(() => {
        flush();
        return scheduleRetentionCleanup();
      })
      .catch(disable);
  }

  function createFormBinding(
    flow: BetaFlowId,
    options: { entryOnMount?: boolean } = {},
  ): FormBinding {
    return {
      flow,
      entryOnMount: options.entryOnMount ?? true,
      lease: null,
      input: null,
      resume: null,
    };
  }

  function prepareFormBinding(binding: FormBinding) {
    if (
      failed ||
      document.visibilityState !== "visible" ||
      !isTrackingPath(window.location.pathname)
    )
      return;
    if (!active) void start();
    if (!canObserve() || binding.lease) return;
    const observedAt = new Date().toISOString();
    const capture = run(async () => {
      await initialize();
      return updateBrowserTrackingState(
        context,
        (state) => {
          const lease = captureFormLease(state, binding.flow, binding.entryOnMount, observedAt);
          return { lease, resume: capturedResumeBinding(state, binding.flow, lease) };
        },
        { create: true },
      );
    });
    binding.lease = capture.then((value) => value?.lease ?? null);
    binding.resume = capture.then((value) => value?.resume ?? null);
    void binding.lease
      .then(() => {
        flush();
        return scheduleRetentionCleanup();
      })
      .catch(disable);
  }

  function trackValidInput(binding: FormBinding) {
    if (!canObserve()) return;
    prepareFormBinding(binding);
    const lease = binding.lease;
    if (!lease) return;
    const observedAt = new Date().toISOString();
    binding.input ??= run(async () => {
      const captured = await lease;
      if (!captured) return null;
      return updateBrowserTrackingState(context, (state) =>
        startBoundAttempt(state, binding.flow, captured, observedAt),
      );
    });
    void binding.input
      .then(() => {
        flush();
        return scheduleRetentionCleanup();
      })
      .catch(disable);
  }

  function markResultReady(binding: FormBinding) {
    if (!active || failed || !isTrackingPath(window.location.pathname)) return;
    const value = binding.input ?? binding.resume ?? Promise.resolve(null);
    // Only an existing successful save/navigation may promote this form's captured attempt.
    lastSavedResults.set(binding.flow, value);
  }

  function captureResultBinding(flow: BetaFlowId): ResultObservationBinding | null {
    const value = lastSavedResults.get(flow);
    return value ? { flow, value } : null;
  }

  function observeResult(
    binding: ResultObservationBinding | null,
    observation: "result" | "guide",
  ) {
    if (!binding || !canObserve()) return;
    const observedAt = new Date().toISOString();
    void run(async () => {
      const captured = await binding.value;
      if (!captured) return;
      await updateBrowserTrackingState(context, (state) =>
        observeBoundResult(state, context, binding.flow, captured, observation, observedAt),
      );
    })
      .then(() => {
        flush();
        return scheduleRetentionCleanup();
      })
      .catch(disable);
  }

  async function start() {
    if (active || failed) return;
    active = true;
    sentThisRound.clear();
    retryAfter.clear();
    exhausted.clear();
    window.addEventListener("online", onOnline);
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisible);
    if (!canObserve()) return;
    try {
      await initialize();
      flush();
      await scheduleRetentionCleanup();
    } catch {
      disable();
    }
  }

  function stop() {
    active = false;
    retentionRevision += 1;
    window.clearTimeout(retentionTimer);
    cancelWait?.();
    window.removeEventListener("online", onOnline);
    window.removeEventListener("storage", onStorage);
    document.removeEventListener("visibilitychange", onVisible);
  }

  return {
    start,
    stop,
    createFormBinding,
    prepareFormBinding,
    trackValidInput,
    markResultReady,
    captureResultBinding,
    observeResult,
  };
}

export type BetaBrowserTracker = ReturnType<typeof createBetaBrowserTracker>;

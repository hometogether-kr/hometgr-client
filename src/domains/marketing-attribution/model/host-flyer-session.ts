import { z } from "zod";

import {
  type HostFlyerAttribution,
  hostFlyerAttributionSchema,
  hostFlyerEntryIdSchema,
  HOST_FLYER_RETURN_PARAM,
  readHostFlyerUrl,
} from "./host-flyer-campaign";

const MEASUREMENT_ID = process.env.NEXT_PUBLIC_HOST_FLYER_GA4_ID ?? "";
export const hostFlyerMeasurementId = /^G-[A-Z0-9]+$/.test(MEASUREMENT_ID) ? MEASUREMENT_ID : "";

const STORAGE_KEY = "hometogether:host-flyer:v1";
const CHOICE_KEY = "hometogether:host-flyer-consent:v1";
const TTL_MS = 30 * 60 * 1000;
const MAX_RECEIPTS = 64;
const campaignParams = ["utm_source", "utm_medium", "utm_campaign", "utm_content"];

const formIds = ["host_consultation", "room_listing"] as const;
export type FlyerFormId = (typeof formIds)[number];

const sessionSchema = z.object({
  entryId: hostFlyerEntryIdSchema,
  firstLandedAt: z.iso.datetime(),
  expiresAt: z.number(),
  attribution: hostFlyerAttributionSchema,
  startedForms: z.array(z.enum(formIds)),
  sentReceipts: z
    .array(z.string().regex(/^(host_consultation|room_listing):[a-f0-9-]{36}$/i))
    .max(MAX_RECEIPTS)
    .default([]),
});

export type HostFlyerSession = z.infer<typeof sessionSchema>;
export type FlyerConsentStatus = "unavailable" | "ask" | "approved" | "declined";

interface BrowserState {
  entry: HostFlyerAttribution | null;
  firstLandedAt: string;
  session: HostFlyerSession | null;
  choice: "approved" | "declined" | null;
  expires: ReturnType<typeof setTimeout> | undefined;
}

let state: BrowserState | undefined;
const listeners = new Set<() => void>();

function storageGet(key: string): string | null {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function storageSet(key: string, value: string | null) {
  try {
    if (value === null) window.sessionStorage.removeItem(key);
    else window.sessionStorage.setItem(key, value);
  } catch {
    // The current document still works when browser storage is blocked.
  }
}

function restoreSession(): HostFlyerSession | null {
  const stored = storageGet(STORAGE_KEY);
  if (!stored) return null;
  try {
    const parsed = sessionSchema.safeParse(JSON.parse(stored));
    if (parsed.success && parsed.data.expiresAt > Date.now()) return parsed.data;
  } catch {
    // Ignore obsolete or unreadable storage.
  }
  return null;
}

function hasFreshExternalNavigation(url: URL): boolean {
  const navigation = performance.getEntriesByType("navigation")[0] as
    PerformanceNavigationTiming | undefined;
  if (navigation?.type === "reload" || navigation?.type === "back_forward") return false;
  if (!document.referrer) return true;
  return new URL(document.referrer).origin !== url.origin;
}

function initialize(): BrowserState {
  if (state) return state;

  const url = new URL(window.location.href);
  const storedChoice = storageGet(CHOICE_KEY);
  const choice = storedChoice === "approved" || storedChoice === "declined" ? storedChoice : null;
  const external = hasFreshExternalNavigation(url);
  const entry = readHostFlyerUrl(url);
  const resumeMarker = url.searchParams.get(HOST_FLYER_RETURN_PARAM);
  const saved = choice === "approved" ? restoreSession() : null;
  const resuming = Boolean(saved && resumeMarker === saved.entryId);
  const sameFlyer = !entry || saved?.attribution.utm_content === entry.utm_content;

  // Keep the original visit in this tab across the verified OAuth callback and reloads.
  const session = saved && (resuming || (!external && sameFlyer)) ? saved : null;
  state = {
    choice,
    entry,
    firstLandedAt: session?.firstLandedAt ?? new Date(performance.timeOrigin).toISOString(),
    session,
    expires: undefined,
  };
  if (url.searchParams.has(HOST_FLYER_RETURN_PARAM)) {
    url.searchParams.delete(HOST_FLYER_RETURN_PARAM);
    window.history.replaceState(window.history.state, "", url);
  }
  if (choice === "approved" && entry && !session) startSession(state, entry);
  else saveSession(state);
  return state;
}

function publish() {
  for (const listener of listeners) listener();
}

function saveSession(current: BrowserState) {
  clearTimeout(current.expires);
  const session = current.session;
  storageSet(STORAGE_KEY, session ? JSON.stringify(session) : null);
  if (!session) return;

  current.expires = setTimeout(
    () => {
      current.session = null;
      current.entry = null;
      saveSession(current);
      publish();
    },
    Math.max(0, session.expiresAt - Date.now()),
  );
}

function startSession(current: BrowserState, attribution: HostFlyerAttribution) {
  current.session = {
    entryId: crypto.randomUUID(),
    firstLandedAt: current.firstLandedAt,
    expiresAt: Date.now() + TTL_MS,
    attribution,
    startedForms: [],
    sentReceipts: [],
  };
  saveSession(current);
}

export function getHostFlyerSession(): HostFlyerSession | null {
  if (!hostFlyerMeasurementId || typeof window === "undefined") return null;
  return state?.session && state.session.expiresAt > Date.now() ? state.session : null;
}

export function updateHostFlyerSession(startedForm?: FlyerFormId) {
  const session = getHostFlyerSession();
  if (!session || !state) return;
  if (startedForm && !session.startedForms.includes(startedForm))
    session.startedForms.push(startedForm);

  // Scroll and intersection callbacks are frequent. Persist expiry and form starts sparingly.
  const nextExpiry = Date.now() + TTL_MS;
  if (startedForm || nextExpiry - session.expiresAt >= 60_000) {
    session.expiresAt = nextExpiry;
    saveSession(state);
  }
}

export function storeSentHostFlyerReceipt(receipt: string) {
  const session = getHostFlyerSession();
  if (!session || !state) return;
  session.sentReceipts = [...session.sentReceipts, receipt].slice(-MAX_RECEIPTS);
  saveSession(state);
}

export function syncHostFlyerDocument(restoredFromCache = false) {
  if (!hostFlyerMeasurementId) return;
  const current = initialize();
  if (restoredFromCache && current.session) {
    const stored = restoreSession();
    if (storageGet(CHOICE_KEY) === "approved" && stored?.entryId === current.session.entryId) {
      current.session = stored;
      saveSession(current);
    } else {
      clearTimeout(current.expires);
      current.session = null;
      current.entry = null;
    }
  }
  publish();
}

export function clearHostFlyerOnOtherCampaign(search: string) {
  if (!state) return;
  const url = new URL(window.location.href);
  const active = state.session?.attribution ?? state.entry;
  const query = new URLSearchParams(search);
  if (!active || !campaignParams.some((name) => query.has(name))) return;
  const next = readHostFlyerUrl(url);
  if (next?.utm_content === active.utm_content) return;
  state.entry = null;
  state.session = null;
  saveSession(state);
  publish();
}

export const getServerFlyerConsent = (): FlyerConsentStatus => "unavailable";

export function getHostFlyerConsent(): FlyerConsentStatus {
  if (!hostFlyerMeasurementId || typeof window === "undefined") return "unavailable";
  if (!state || (!state.entry && !getHostFlyerSession())) return "unavailable";
  return state.choice ?? "ask";
}

export function subscribeHostFlyer(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setHostFlyerConsent(choice: "approved" | "declined") {
  const current = state;
  if (!current || choice === current.choice) return;
  const entry = current.entry ?? current.session?.attribution;
  if (!entry) return;

  current.entry = entry;
  current.choice = choice;
  storageSet(CHOICE_KEY, choice);
  if (choice === "approved") startSession(current, entry);
  else {
    current.session = null;
    saveSession(current);
  }
  publish();
}

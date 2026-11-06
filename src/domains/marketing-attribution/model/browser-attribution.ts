import {
  approvedExternalAttributionSchema,
  EMPTY_MARKETING_ATTRIBUTION,
  MARKETING_STATE_MAX_AGE_MS,
  type MarketingAttributionSnapshot,
  storedMarketingAttributionSchema,
} from "./source-snapshot";

export const MARKETING_ATTRIBUTION_STORAGE_KEY = "hometogether:marketing:external-attribution:v2";
const LOCK_NAME = "hometogether:marketing:external-attribution";
let documentCapture: Promise<void> | undefined;

function readStoredAttribution() {
  const raw = window.localStorage.getItem(MARKETING_ATTRIBUTION_STORAGE_KEY);
  if (raw === null) return null;
  return storedMarketingAttributionSchema.parse(JSON.parse(raw) as unknown);
}

function getDocumentExternalAttribution(): MarketingAttributionSnapshot | null {
  const navigation = performance.getEntriesByType("navigation")[0];
  if (
    typeof PerformanceNavigationTiming !== "undefined" &&
    navigation instanceof PerformanceNavigationTiming &&
    (navigation.type === "reload" || navigation.type === "back_forward")
  )
    return null;
  if (document.referrer) {
    try {
      if (new URL(document.referrer).origin === window.location.origin) return null;
    } catch {
      return null;
    }
  }
  const params = new URLSearchParams(window.location.search);
  const names = ["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const;
  if (names.some((name) => params.getAll(name).length !== 1)) return null;
  const parsed = approvedExternalAttributionSchema.safeParse({
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    utm_content: params.get("utm_content"),
  });
  return parsed.success ? parsed.data : null;
}

/** The first/latest pair shares one immutable 90-day epoch. */
function pruneAttribution() {
  const stored = readStoredAttribution();
  if (stored && Date.now() >= stored.created_at + MARKETING_STATE_MAX_AGE_MS) {
    window.localStorage.removeItem(MARKETING_ATTRIBUTION_STORAGE_KEY);
    return null;
  }
  return stored;
}

export async function cleanupMarketingAttribution(): Promise<number | null> {
  if (typeof navigator.locks?.request !== "function") return null;
  return navigator.locks.request(LOCK_NAME, () => {
    const stored = pruneAttribution();
    return stored ? stored.created_at + MARKETING_STATE_MAX_AGE_MS : null;
  });
}

/** URL/referrer are inspected only in memory, once per document, never on SPA navigation. */
export function captureDocumentMarketingAttribution(): Promise<void> {
  if (documentCapture) return documentCapture;
  documentCapture = (async () => {
    if (typeof navigator.locks?.request !== "function") return;
    await navigator.locks.request(LOCK_NAME, () => {
      const stored = pruneAttribution();
      const incoming = getDocumentExternalAttribution();
      if (!incoming) return;
      const serialized = JSON.stringify({
        version: 2,
        created_at: stored?.created_at ?? Date.now(),
        first: stored?.first ?? incoming,
        latest: incoming,
      });
      window.localStorage.setItem(MARKETING_ATTRIBUTION_STORAGE_KEY, serialized);
      if (window.localStorage.getItem(MARKETING_ATTRIBUTION_STORAGE_KEY) !== serialized) {
        throw new Error("Attribution storage unavailable");
      }
    });
  })();
  return documentCapture;
}

export function readMarketingAttributionSnapshot(): MarketingAttributionSnapshot {
  const stored = readStoredAttribution();
  return stored && Date.now() < stored.created_at + MARKETING_STATE_MAX_AGE_MS
    ? stored.latest
    : { ...EMPTY_MARKETING_ATTRIBUTION };
}

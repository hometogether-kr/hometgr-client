"use client";

import type {
  AttributionEventInput,
  MarketingSource,
  TrackingEventName,
} from "@/domains/marketing-attribution";

const ANONYMOUS_ID_KEY = "hometogether:marketing:anonymous-id";
const SESSION_ID_KEY = "hometogether:marketing:session-id";
const REQUEST_TIMEOUT_MS = 1_500;

export interface TrackingContext {
  campaign?: string;
  source: MarketingSource;
}

function createUuid() {
  return crypto.randomUUID();
}

function getOrCreateId(storage: Storage, key: string) {
  try {
    const existing = storage.getItem(key);
    if (existing) return existing;

    const value = createUuid();
    storage.setItem(key, value);
    return value;
  } catch {
    // Storage-denied visitors can still contact the channel, just without a
    // stable browser identifier across visits.
    return createUuid();
  }
}

function getDeviceType(): AttributionEventInput["device_type"] {
  const userAgent = navigator.userAgent.toLowerCase();
  const width = window.innerWidth;

  if (/ipad|tablet/.test(userAgent) || (width >= 768 && width <= 1_024)) return "tablet";
  if (/mobi|android|iphone|ipod/.test(userAgent) || width < 768) return "mobile";
  return "desktop";
}

function getOptionalSearchParam(searchParams: URLSearchParams, name: string) {
  return searchParams.get(name) || undefined;
}

function createAttributionEvent(
  context: TrackingContext,
  eventName: TrackingEventName,
): AttributionEventInput {
  const currentUrl = new URL(window.location.href);

  return {
    anonymous_id: getOrCreateId(localStorage, ANONYMOUS_ID_KEY),
    campaign: context.campaign,
    device_type: getDeviceType(),
    event_id: createUuid(),
    event_name: eventName,
    landing_url: currentUrl.toString(),
    referrer: document.referrer || undefined,
    session_id: getOrCreateId(sessionStorage, SESSION_ID_KEY),
    source: context.source,
    utm_campaign: getOptionalSearchParam(currentUrl.searchParams, "utm_campaign"),
    utm_content: getOptionalSearchParam(currentUrl.searchParams, "utm_content"),
    utm_medium: getOptionalSearchParam(currentUrl.searchParams, "utm_medium"),
    utm_source: getOptionalSearchParam(currentUrl.searchParams, "utm_source"),
    utm_term: getOptionalSearchParam(currentUrl.searchParams, "utm_term"),
  };
}

/** Limits the wait so tracking failures can never block a Kakao inquiry. */
export async function trackAttributionEvent(
  context: TrackingContext,
  eventName: TrackingEventName,
) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch("/api/marketing/attribution", {
      body: JSON.stringify(createAttributionEvent(context, eventName)),
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      method: "POST",
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Tracking request failed (${response.status}).`);
  } finally {
    window.clearTimeout(timeout);
  }
}

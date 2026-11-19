const PUBLIC_HOST = "hometogether.kr";
const EVENT_PATH = "/event_1";
const HEALTH_PATH = `${EVENT_PATH}/_router/health`;

function getEventOrigin(value) {
  const origin = new URL(value);
  if (
    origin.protocol !== "https:" ||
    origin.hostname === PUBLIC_HOST ||
    origin.username ||
    origin.password ||
    origin.pathname !== "/" ||
    origin.search ||
    origin.hash
  ) {
    throw new Error("EVENT_ORIGIN must be a separate HTTPS origin");
  }
  return origin;
}

function unavailable(message, status) {
  return new Response(message, {
    status,
    headers: { "Cache-Control": "no-store", "Content-Type": "text/plain; charset=utf-8" },
  });
}

export default {
  async fetch(request, env) {
    const publicUrl = new URL(request.url);
    const isEventPath =
      publicUrl.pathname === EVENT_PATH || publicUrl.pathname.startsWith(`${EVENT_PATH}/`);

    // The route wildcard also matches sibling names and query strings.
    if (publicUrl.hostname !== PUBLIC_HOST || !isEventPath) {
      return fetch(request);
    }

    if (publicUrl.pathname === HEALTH_PATH && ["GET", "HEAD"].includes(request.method)) {
      return new Response(request.method === "HEAD" ? null : "event-router-ready", {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store",
          "X-Hometogether-Event-Router": "ready",
        },
      });
    }

    // Keep serving the current origin until the event deployment is available.
    if (!env.EVENT_ORIGIN) return fetch(request);

    let eventOrigin;
    try {
      eventOrigin = getEventOrigin(env.EVENT_ORIGIN);
    } catch {
      return unavailable("Event origin is not configured correctly.", 503);
    }

    const upstreamUrl = new URL(publicUrl.pathname + publicUrl.search, eventOrigin);
    const headers = new Headers(request.headers);
    const eventCookies = (headers.get("cookie") || "")
      .split(";")
      .map((cookie) => cookie.trim())
      .filter((cookie) => cookie.startsWith("ht-event1-"));
    headers.delete("cookie");
    headers.delete("authorization");
    headers.delete("host");
    if (eventCookies.length) headers.set("cookie", eventCookies.join("; "));
    headers.set("X-Forwarded-Host", PUBLIC_HOST);
    headers.set("X-Forwarded-Proto", "https");

    const upstreamRequest = new Request(upstreamUrl, request);
    const forwardedRequest = new Request(upstreamRequest, { headers, redirect: "manual" });
    let upstreamResponse;
    try {
      upstreamResponse = await fetch(forwardedRequest);
    } catch {
      return unavailable("Event service is temporarily unavailable.", 502);
    }

    const response = new Response(upstreamResponse.body, upstreamResponse);
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("Cloudflare-CDN-Cache-Control", "no-store");
    const location = response.headers.get("location");
    if (location) {
      const redirectUrl = new URL(location, upstreamUrl);
      if (redirectUrl.origin === eventOrigin.origin) {
        redirectUrl.host = publicUrl.host;
        response.headers.set("location", redirectUrl.href);
      }
    }
    return response;
  },
};

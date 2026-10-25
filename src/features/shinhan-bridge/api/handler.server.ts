import "server-only";

import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  shinhanApplicationResponseSchema,
  shinhanConsentsEnvelopeSchema,
} from "@/domains/shinhan-application";

import { type BridgeEnvironment, getBridgeEnvironment } from "../config/environment.server";
import { BridgeFailure, expiredSession, unavailable } from "./errors.server";
import {
  encodeSession,
  forgetInitialization,
  getCookieNames,
  initializeSession,
  prepareCsrf,
  readCookie,
  readSession,
  validateCsrf,
} from "./session.server";
import { readBoundedJson, requestUpstream, upstreamContractVersion } from "./upstream.server";

const routeSchema = z.array(z.string()).min(1).max(3);
const emptyBodySchema = z.strictObject({});
interface BridgeRoute {
  path: string;
  action: "consents" | "sessions" | "reset" | "application";
  expectedStatus: number;
}

function resolveRoute(method: string, segments: unknown): BridgeRoute {
  const parsed = routeSchema.safeParse(segments);
  if (!parsed.success) throw new BridgeFailure(404, "NOT_FOUND", "신청 경로를 찾을 수 없어요.");
  const path = parsed.data.join("/");
  if (path === "consents" && method === "GET")
    return { path, action: "consents", expectedStatus: 200 };
  if (path === "sessions" && method === "POST")
    return { path, action: "sessions", expectedStatus: 201 };
  if (path === "sessions/reset" && method === "POST")
    return { path, action: "reset", expectedStatus: 200 };
  if (path === "applications" && method === "POST")
    return { path, action: "application", expectedStatus: 201 };
  const [resource, id, action] = parsed.data;
  if (
    resource === "applications" &&
    z.uuid().safeParse(id).success &&
    ((action === "current" && method === "GET") ||
      (action === "concerns" && method === "PUT") ||
      (action === "introduction" && method === "POST"))
  )
    return { path, action: "application", expectedStatus: 200 };
  throw new BridgeFailure(404, "NOT_FOUND", "신청 경로를 찾을 수 없어요.");
}

function validateBrowserRequest(request: Request, environment: BridgeEnvironment) {
  const url = new URL(request.url);
  if (url.search) throw new BridgeFailure(400, "INVALID_QUERY", "요청 경로를 확인해 주세요.");
  // Next normalizes request.url to localhost in development. Match the browser Host
  // against complete configured origins instead of trusting forwarded host headers.
  const browserOrigin = environment.SHINHAN_ALLOWED_ORIGINS.find((allowed) => {
    const expected = new URL(allowed);
    return expected.host === request.headers.get("host") && expected.protocol === url.protocol;
  });
  if (!browserOrigin) {
    throw new BridgeFailure(403, "FORBIDDEN", "허용된 신청 화면에서 시도해 주세요.");
  }
  const origin = request.headers.get("origin");
  const site = request.headers.get("sec-fetch-site");
  if (origin && origin !== browserOrigin)
    throw new BridgeFailure(403, "CSRF_INVALID", "허용된 신청 화면에서 시도해 주세요.");
  if (request.method === "GET") {
    if (site !== null && site !== "same-origin" && site !== "none")
      throw new BridgeFailure(403, "CSRF_INVALID", "허용된 신청 화면에서 시도해 주세요.");
    return browserOrigin;
  }
  if (origin !== browserOrigin || site !== "same-origin")
    throw new BridgeFailure(403, "CSRF_INVALID", "허용된 신청 화면에서 시도해 주세요.");
  if (!/^application\/json(?:\s*;.*)?$/i.test(request.headers.get("content-type") ?? "")) {
    throw new BridgeFailure(400, "MALFORMED_JSON", "요청 형식을 확인해 주세요.");
  }
  return browserOrigin;
}

function json(body: unknown, status = 200, version = "1.0.0") {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Contract-Version": version,
      "X-Content-Type-Options": "nosniff",
      Vary: "Cookie, Origin",
    },
  });
}

function cookieOptions(origin: string, sameSite: "lax" | "strict", expiresAt: string) {
  return {
    httpOnly: true,
    secure: new URL(origin).protocol === "https:",
    sameSite,
    path: "/",
    expires: new Date(expiresAt),
    maxAge: Math.max(0, Math.floor((Date.parse(expiresAt) - Date.now()) / 1000)),
  };
}

function clearSessionCookies(
  response: NextResponse,
  environment: BridgeEnvironment,
  origin: string,
) {
  const names = getCookieNames(environment);
  response.cookies.set(names.session, "", cookieOptions(origin, "lax", new Date(0).toISOString()));
  response.cookies.set(names.csrf, "", cookieOptions(origin, "strict", new Date(0).toISOString()));
}

export async function handleShinhanBridge(request: Request, segments: unknown) {
  const environment = getBridgeEnvironment();
  let origin: string | undefined;
  let version = "1.0.0";
  try {
    const route = resolveRoute(request.method, segments);
    version = upstreamContractVersion(route.path);
    if (!environment) throw unavailable();
    if (route.action === "sessions" && environment.SHINHAN_APP_ENV !== "local") version = "1.1.0";
    origin = validateBrowserRequest(request, environment);
    const names = getCookieNames(environment);
    if (route.action === "consents") {
      const result = await requestUpstream(
        { environment, path: route.path, method: "GET", expectedStatus: 200 },
        shinhanConsentsEnvelopeSchema,
      );
      const document = result.body.data.required;
      if (
        createHash("sha256").update(document.content).digest("hex") !== document.sha256 ||
        (environment.SHINHAN_APP_ENV !== "local" && result.body.data.localOnly)
      )
        throw unavailable();
      const csrf = prepareCsrf(request, environment, origin);
      const response = json({ ...result.body, csrfToken: csrf.nonce }, 200, version);
      response.cookies.set(
        names.csrf,
        csrf.cookieValue,
        cookieOptions(origin, "strict", csrf.expiresAt),
      );
      return response;
    }
    let body: unknown;
    let csrf: string | undefined;
    if (route.action === "reset") {
      // An expired-session response already removed both cookies. Origin checks still apply.
      if (readCookie(request, names.csrf)) validateCsrf(request, environment, origin);
      body = await readBoundedJson(request, 16384);
      if (!emptyBodySchema.safeParse(body).success)
        throw new BridgeFailure(422, "VALIDATION_ERROR", "요청 형식을 확인해 주세요.");
      forgetInitialization(request, environment, origin);
      const response = json({ data: { reset: true } });
      clearSessionCookies(response, environment, origin);
      return response;
    }
    if (request.method !== "GET") {
      csrf = validateCsrf(request, environment, origin);
      body = await readBoundedJson(request, 16384);
    }
    if (route.action === "sessions") {
      if (!csrf || !emptyBodySchema.safeParse(body).success)
        throw new BridgeFailure(422, "VALIDATION_ERROR", "요청 형식을 확인해 주세요.");
      const session = await initializeSession(request, environment, csrf, origin);
      const response = json({ data: { expiresAt: session.expiresAt } }, 201, version);
      response.cookies.set(
        names.session,
        encodeSession(session, environment, origin, csrf),
        cookieOptions(origin, "lax", session.expiresAt),
      );
      if (session.replayed) response.headers.set("Idempotency-Replayed", "true");
      return response;
    }
    const session = readSession(request, environment, origin);
    if (!session) throw expiredSession();
    let idempotencyKey: string | undefined;
    if (request.method !== "GET") {
      const key = z.uuid().safeParse(request.headers.get("idempotency-key"));
      if (!key.success)
        throw new BridgeFailure(400, "INVALID_IDEMPOTENCY_KEY", "요청 식별자를 확인해 주세요.");
      idempotencyKey = key.data;
    }
    const result = await requestUpstream(
      {
        environment,
        path: route.path,
        method: request.method,
        expectedStatus: route.expectedStatus,
        body,
        token: session.sessionToken,
        idempotencyKey,
      },
      shinhanApplicationResponseSchema,
    );
    const response = json(result.body, route.expectedStatus, version);
    if (result.replayed) response.headers.set("Idempotency-Replayed", "true");
    return response;
  } catch (error) {
    const failure = error instanceof BridgeFailure ? error : unavailable();
    const response = json(failure.body, failure.status, version);
    if (failure.retryAfter) response.headers.set("Retry-After", failure.retryAfter);
    if (
      failure.status === 401 &&
      failure.body.error.code === "SESSION_EXPIRED" &&
      environment &&
      origin
    ) {
      clearSessionCookies(response, environment, origin);
      forgetInitialization(request, environment, origin);
    }
    return response;
  }
}

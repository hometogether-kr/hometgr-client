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
  CSRF_COOKIE,
  csrfToken,
  encodeSession,
  forgetInitialization,
  initializeSession,
  readSession,
  SESSION_COOKIE,
  validateCsrf,
} from "./session.server";
import { readBoundedJson, requestUpstream } from "./upstream.server";

const routeSchema = z.array(z.string()).min(1).max(3);
const emptyBodySchema = z.strictObject({});
interface BridgeRoute {
  path: string;
  action: "consents" | "sessions" | "application";
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
    return;
  }
  if (origin !== browserOrigin || site !== "same-origin")
    throw new BridgeFailure(403, "CSRF_INVALID", "허용된 신청 화면에서 시도해 주세요.");
  if (!/^application\/json(?:\s*;.*)?$/i.test(request.headers.get("content-type") ?? "")) {
    throw new BridgeFailure(400, "MALFORMED_JSON", "요청 형식을 확인해 주세요.");
  }
}

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Contract-Version": "1.0.0",
      "X-Content-Type-Options": "nosniff",
      Vary: "Cookie, Origin",
    },
  });
}

export async function handleShinhanBridge(request: Request, segments: unknown) {
  const environment = getBridgeEnvironment();
  try {
    if (!environment) throw unavailable();
    const route = resolveRoute(request.method, segments);
    validateBrowserRequest(request, environment);
    if (route.action === "consents") {
      const result = await requestUpstream(
        { environment, path: route.path, method: "GET", expectedStatus: 200 },
        shinhanConsentsEnvelopeSchema,
      );
      for (const document of [result.body.data.required, result.body.data.optional]) {
        if (createHash("sha256").update(document.content).digest("hex") !== document.sha256)
          throw unavailable();
      }
      const csrf = csrfToken(request);
      const response = json({ ...result.body, csrfToken: csrf });
      response.cookies.set(CSRF_COOKIE, csrf, {
        httpOnly: true,
        secure: new URL(request.url).protocol === "https:",
        sameSite: "strict",
        path: "/",
        maxAge: 7200,
      });
      return response;
    }
    let body: unknown;
    let csrf: string | undefined;
    if (request.method !== "GET") {
      csrf = validateCsrf(request);
      body = await readBoundedJson(request, 16384);
    }
    if (route.action === "sessions") {
      if (!csrf || !emptyBodySchema.safeParse(body).success)
        throw new BridgeFailure(422, "VALIDATION_ERROR", "요청 형식을 확인해 주세요.");
      const session = await initializeSession(request, environment, csrf);
      const response = json({ data: { expiresAt: session.expiresAt } }, 201);
      response.cookies.set(SESSION_COOKIE, encodeSession(session, environment), {
        httpOnly: true,
        secure: new URL(request.url).protocol === "https:",
        sameSite: "lax",
        path: "/",
        expires: new Date(session.expiresAt),
        maxAge: Math.max(0, Math.floor((Date.parse(session.expiresAt) - Date.now()) / 1000)),
      });
      return response;
    }
    const session = readSession(request, environment);
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
    const response = json(result.body, route.expectedStatus);
    if (result.replayed) response.headers.set("Idempotency-Replayed", "true");
    return response;
  } catch (error) {
    const failure = error instanceof BridgeFailure ? error : unavailable();
    const response = json(failure.body, failure.status);
    if (failure.retryAfter) response.headers.set("Retry-After", failure.retryAfter);
    if (failure.status === 401 && failure.body.error.code === "SESSION_EXPIRED") {
      response.cookies.set(SESSION_COOKIE, "", {
        httpOnly: true,
        secure: new URL(request.url).protocol === "https:",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
      if (environment) forgetInitialization(request, environment);
    }
    return response;
  }
}

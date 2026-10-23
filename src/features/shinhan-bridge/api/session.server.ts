import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { z } from "zod";

import type { BridgeEnvironment } from "../config/environment.server";
import { BridgeFailure, expiredSession, unavailable } from "./errors.server";
import { requestUpstream } from "./upstream.server";

export const SESSION_COOKIE = "shinhan_intake";
export const CSRF_COOKIE = "shinhan_csrf";
const tokenSchema = z.string().regex(/^[A-Za-z0-9_-]{32,256}$/);
const sessionSchema = z.object({
  sessionToken: tokenSchema,
  expiresAt: z.iso.datetime({ offset: true }),
});
const sessionEnvelopeSchema = z.object({ data: sessionSchema });
type IntakeSession = z.infer<typeof sessionSchema>;

function sign(value: string, environment: BridgeEnvironment) {
  return createHmac("sha256", environment.SHINHAN_CLIENT_IP_HMAC_SECRET)
    .update(value)
    .digest("hex");
}

export function sameSecret(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function readCookie(request: Request, name: string) {
  const values = (request.headers.get("cookie") ?? "")
    .split(";")
    .map((item) => item.trim())
    .filter((item) => item.startsWith(`${name}=`));
  if (values.length > 1)
    throw new BridgeFailure(403, "CSRF_INVALID", "신청 화면을 새로 열어 주세요.");
  return values[0]?.slice(name.length + 1);
}

export function csrfToken(request: Request) {
  const existing = readCookie(request, CSRF_COOKIE);
  return existing && /^[a-f0-9]{64}$/.test(existing) ? existing : randomBytes(32).toString("hex");
}

export function validateCsrf(request: Request) {
  const cookie = readCookie(request, CSRF_COOKIE);
  const header = request.headers.get("X-Shinhan-CSRF");
  if (
    !cookie ||
    !header ||
    !/^[a-f0-9]{64}$/.test(cookie) ||
    !/^[a-f0-9]{64}$/.test(header) ||
    !sameSecret(cookie, header)
  ) {
    throw new BridgeFailure(403, "CSRF_INVALID", "개인정보 안내를 다시 확인한 뒤 시도해 주세요.");
  }
  return cookie;
}

export function encodeSession(session: IntakeSession, environment: BridgeEnvironment) {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(`session:${payload}`, environment)}`;
}

export function readSession(request: Request, environment: BridgeEnvironment) {
  const cookie = readCookie(request, SESSION_COOKIE);
  if (!cookie) return null;
  if (cookie.length > 1200) throw expiredSession();
  const [payload, signature, extra] = cookie.split(".");
  if (
    !payload ||
    !signature ||
    extra ||
    !sameSecret(signature, sign(`session:${payload}`, environment))
  )
    throw expiredSession();
  try {
    const parsed = sessionSchema.safeParse(
      JSON.parse(Buffer.from(payload, "base64url").toString("utf8")),
    );
    if (!parsed.success || Date.parse(parsed.data.expiresAt) <= Date.now()) throw expiredSession();
    return parsed.data;
  } catch {
    throw expiredSession();
  }
}

interface SessionInitialization {
  promise: Promise<IntakeSession>;
  expiresAt: number;
}

// Keep successful initialization until fixed expiry, including when the first cookie response was lost.
// This is deliberately process-local and is disabled together with the whole bridge in production.
const initializingSessions = new Map<string, SessionInitialization>();

export async function initializeSession(
  request: Request,
  environment: BridgeEnvironment,
  csrf: string,
) {
  const existing = readSession(request, environment);
  if (existing) return existing;
  const key = sign(`initialize:${new URL(request.url).origin}:${csrf}`, environment);
  const now = Date.now();
  for (const [entryKey, entry] of initializingSessions) {
    if (entry.expiresAt <= now) initializingSessions.delete(entryKey);
  }
  const pending = initializingSessions.get(key);
  if (pending) return pending.promise;
  if (initializingSessions.size >= 1000) throw unavailable();
  const entry: SessionInitialization = {
    promise: Promise.resolve(null).then(async () => {
      try {
        const result = await requestUpstream(
          {
            environment,
            path: "sessions",
            method: "POST",
            expectedStatus: 201,
            body: {},
            // Only loopback origins are enabled; forwarded IP headers are intentionally untrusted.
            clientKey: sign("local-client:loopback", environment),
          },
          sessionEnvelopeSchema,
        );
        const expiresAt = Date.parse(result.body.data.expiresAt);
        if (expiresAt <= Date.now() || expiresAt > Date.now() + 7230000) throw unavailable();
        entry.expiresAt = expiresAt;
        return result.body.data;
      } catch (error) {
        initializingSessions.delete(key);
        throw error;
      }
    }),
    expiresAt: now + 20000,
  };
  initializingSessions.set(key, entry);
  return entry.promise;
}

export function forgetInitialization(request: Request, environment: BridgeEnvironment) {
  try {
    const csrf = readCookie(request, CSRF_COOKIE);
    if (csrf)
      initializingSessions.delete(
        sign(`initialize:${new URL(request.url).origin}:${csrf}`, environment),
      );
  } catch {
    // An ambiguous incoming cookie must not prevent the expired session cookie from being cleared.
  }
}

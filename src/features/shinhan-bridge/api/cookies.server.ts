import "server-only";

import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { z } from "zod";

import type { BridgeEnvironment } from "../config/environment.server";
import { BridgeFailure, expiredSession, unavailable } from "./errors.server";

export const SESSION_COOKIE = "shinhan_intake";
export const CSRF_COOKIE = "shinhan_csrf";
export const SESSION_LIFETIME_MS = 2 * 60 * 60 * 1000;
const nonceSchema = z.string().regex(/^[a-f0-9]{64}$/);
export const sessionSchema = z.strictObject({
  sessionToken: z.string().regex(/^[A-Za-z0-9_-]{32,256}$/),
  expiresAt: z.iso.datetime({ offset: true }),
});
export type IntakeSession = z.infer<typeof sessionSchema>;
const csrfPayloadSchema = z.strictObject({
  version: z.literal(1),
  nonce: nonceSchema,
  expiresAt: z.iso.datetime({ offset: true }),
});
const sessionPayloadSchema = sessionSchema.extend({
  version: z.literal(1),
  csrfNonceHash: nonceSchema,
});

export interface PreparedCsrf {
  nonce: string;
  expiresAt: string;
  cookieValue: string;
}

export function getCookieNames(environment: BridgeEnvironment) {
  return environment.SHINHAN_APP_ENV === "local"
    ? { session: SESSION_COOKIE, csrf: CSRF_COOKIE }
    : { session: `__Host-${SESSION_COOKIE}`, csrf: `__Host-${CSRF_COOKIE}` };
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
  if (values.length > 1) throw expiredSession();
  return values[0]?.slice(name.length + 1);
}

function remoteSignature(
  payload: string,
  purpose: "csrf" | "session",
  environment: BridgeEnvironment,
  origin: string,
) {
  if (
    !environment.SHINHAN_BFF_STATE_SECRET ||
    !environment.SHINHAN_ALLOWED_ORIGINS.includes(origin)
  ) {
    throw unavailable();
  }
  return createHmac("sha256", environment.SHINHAN_BFF_STATE_SECRET)
    .update(`shinhan-cookie:v1\n${purpose}\n${environment.SHINHAN_APP_ENV}\n${origin}\n${payload}`)
    .digest("hex");
}

function encodeRemoteCookie(
  value: unknown,
  purpose: "csrf" | "session",
  environment: BridgeEnvironment,
  origin: string,
) {
  const payload = Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${payload}.${remoteSignature(payload, purpose, environment, origin)}`;
}

function decodeRemoteCookie<T>(
  cookie: string,
  purpose: "csrf" | "session",
  environment: BridgeEnvironment,
  origin: string,
  schema: z.ZodType<T>,
) {
  if (cookie.length > 1200) throw expiredSession();
  const [payload, signature, extra] = cookie.split(".");
  if (
    !payload ||
    !/^[A-Za-z0-9_-]+$/.test(payload) ||
    !signature ||
    !nonceSchema.safeParse(signature).success ||
    extra !== undefined ||
    !sameSecret(signature, remoteSignature(payload, purpose, environment, origin))
  )
    throw expiredSession();
  try {
    const bytes = Buffer.from(payload, "base64url");
    if (bytes.toString("base64url") !== payload) throw expiredSession();
    return schema.parse(JSON.parse(bytes.toString("utf8")));
  } catch {
    throw expiredSession();
  }
}

export function readRemoteCsrf(request: Request, environment: BridgeEnvironment, origin: string) {
  const cookie = readCookie(request, getCookieNames(environment).csrf);
  if (!cookie) return null;
  const state = decodeRemoteCookie(cookie, "csrf", environment, origin, csrfPayloadSchema);
  if (Date.parse(state.expiresAt) <= Date.now()) throw expiredSession();
  return { nonce: state.nonce, expiresAt: state.expiresAt, cookieValue: cookie };
}

export function prepareCsrf(
  request: Request,
  environment: BridgeEnvironment,
  origin: string,
): PreparedCsrf {
  if (environment.SHINHAN_APP_ENV === "local") {
    const existing = nonceSchema.safeParse(readCookie(request, CSRF_COOKIE));
    const nonce = existing.success ? existing.data : randomBytes(32).toString("hex");
    return {
      nonce,
      expiresAt: new Date(Date.now() + SESSION_LIFETIME_MS).toISOString(),
      cookieValue: nonce,
    };
  }
  const existing = readRemoteCsrf(request, environment, origin);
  if (existing) return existing;
  if (readCookie(request, getCookieNames(environment).session)) throw expiredSession();
  const state = {
    version: 1,
    nonce: randomBytes(32).toString("hex"),
    expiresAt: new Date(Date.now() + SESSION_LIFETIME_MS).toISOString(),
  };
  return {
    nonce: state.nonce,
    expiresAt: state.expiresAt,
    cookieValue: encodeRemoteCookie(state, "csrf", environment, origin),
  };
}

export function validateCsrf(request: Request, environment: BridgeEnvironment, origin: string) {
  const nonce =
    environment.SHINHAN_APP_ENV === "local"
      ? readCookie(request, CSRF_COOKIE)
      : readRemoteCsrf(request, environment, origin)?.nonce;
  const header = request.headers.get("X-Shinhan-CSRF");
  if (
    !nonce ||
    !header ||
    !nonceSchema.safeParse(nonce).success ||
    !nonceSchema.safeParse(header).success ||
    !sameSecret(nonce, header)
  ) {
    throw new BridgeFailure(403, "CSRF_INVALID", "개인정보 안내를 다시 확인한 뒤 시도해 주세요.");
  }
  return nonce;
}

function localSignature(payload: string, environment: BridgeEnvironment) {
  return createHmac("sha256", environment.SHINHAN_CLIENT_IP_HMAC_SECRET)
    .update(`session:${payload}`)
    .digest("hex");
}

export function encodeSession(
  session: IntakeSession,
  environment: BridgeEnvironment,
  origin: string,
  csrfNonce: string,
) {
  const value = sessionSchema.parse({
    sessionToken: session.sessionToken,
    expiresAt: session.expiresAt,
  });
  if (environment.SHINHAN_APP_ENV === "local") {
    const payload = Buffer.from(JSON.stringify(value)).toString("base64url");
    return `${payload}.${localSignature(payload, environment)}`;
  }
  return encodeRemoteCookie(
    {
      ...value,
      version: 1,
      csrfNonceHash: createHash("sha256").update(nonceSchema.parse(csrfNonce)).digest("hex"),
    },
    "session",
    environment,
    origin,
  );
}

export function readSession(request: Request, environment: BridgeEnvironment, origin: string) {
  const cookie = readCookie(request, getCookieNames(environment).session);
  if (!cookie) return null;
  if (environment.SHINHAN_APP_ENV !== "local") {
    const state = decodeRemoteCookie(cookie, "session", environment, origin, sessionPayloadSchema);
    const csrf = readRemoteCsrf(request, environment, origin);
    if (
      !csrf ||
      Date.parse(state.expiresAt) <= Date.now() ||
      Date.parse(state.expiresAt) > Date.parse(csrf.expiresAt) ||
      !sameSecret(state.csrfNonceHash, createHash("sha256").update(csrf.nonce).digest("hex"))
    ) {
      throw expiredSession();
    }
    return { sessionToken: state.sessionToken, expiresAt: state.expiresAt };
  }
  if (cookie.length > 1200) throw expiredSession();
  const [payload, signature, extra] = cookie.split(".");
  if (
    !payload ||
    !signature ||
    extra !== undefined ||
    !sameSecret(signature, localSignature(payload, environment))
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

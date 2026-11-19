import "server-only";

import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { z } from "zod";

const operatorEnvSchema = z.object({
  EVENT_OPS_ACCESS_KEY: z.string().regex(/^[A-Za-z0-9_-]{32,128}$/),
  EVENT_PUBLIC_URL: z.url(),
  EVENT_APP_ENV: z.enum(["local", "development", "production"]),
});
const sessionSchema = z.object({
  version: z.literal(1),
  issuedAt: z.number().int(),
  expiresAt: z.number().int(),
  nonce: z.string().regex(/^[A-Za-z0-9_-]{24}$/),
});

export const operatorCookieName = "ht-event1-ops";
const sessionDuration = 8 * 60 * 60;

export function getOperatorConfig() {
  const parsed = operatorEnvSchema.safeParse(process.env);
  if (!parsed.success) return null;
  const url = new URL(parsed.data.EVENT_PUBLIC_URL);
  if (!["http:", "https:"].includes(url.protocol)) return null;
  if (parsed.data.EVENT_APP_ENV === "production" && url.protocol !== "https:") return null;
  return {
    accessKey: parsed.data.EVENT_OPS_ACCESS_KEY,
    origin: url.origin,
    secure: url.protocol === "https:",
  };
}

function sessionSignature(payload: string, accessKey: string) {
  return createHmac("sha256", accessKey).update(`event1-operator-session:${payload}`).digest();
}

export function matchesOperatorKey(value: string) {
  const config = getOperatorConfig();
  if (!config) return false;
  const expected = createHash("sha256").update(config.accessKey).digest();
  const actual = createHash("sha256").update(value).digest();
  return timingSafeEqual(actual, expected);
}

export function createOperatorSession() {
  const config = getOperatorConfig();
  if (!config) throw new Error("Operator access is not configured");
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(
    JSON.stringify({
      version: 1,
      issuedAt: now,
      expiresAt: now + sessionDuration,
      nonce: randomBytes(18).toString("base64url"),
    }),
  ).toString("base64url");
  return `${payload}.${sessionSignature(payload, config.accessKey).toString("base64url")}`;
}

export function isValidOperatorSession(value: string | undefined) {
  const config = getOperatorConfig();
  if (!config || !value || value.length > 512) return false;
  try {
    const parts = value.split(".");
    if (parts.length !== 2) return false;
    const [payload, signature] = parts;
    if (!/^[A-Za-z0-9_-]+$/.test(payload) || !/^[A-Za-z0-9_-]{43}$/.test(signature)) return false;
    const expected = sessionSignature(payload, config.accessKey);
    const actual = Buffer.from(signature, "base64url");
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false;
    const session = sessionSchema.safeParse(
      JSON.parse(Buffer.from(payload, "base64url").toString("utf8")),
    );
    if (!session.success) return false;
    const now = Math.floor(Date.now() / 1000);
    return (
      session.data.issuedAt <= now &&
      session.data.expiresAt > now &&
      session.data.expiresAt - session.data.issuedAt === sessionDuration
    );
  } catch {
    return false;
  }
}

export async function hasOperatorSession() {
  return isValidOperatorSession((await cookies()).get(operatorCookieName)?.value);
}

export function hasOperatorRequestSession(request: NextRequest) {
  return isValidOperatorSession(request.cookies.get(operatorCookieName)?.value);
}

export function operatorCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: getOperatorConfig()?.secure ?? true,
    path: "/event_1",
    maxAge: sessionDuration,
  };
}

import "server-only";

import { createHmac } from "node:crypto";
import { z } from "zod";

import type { BridgeEnvironment } from "../config/environment.server";
import { createClientKey } from "./client-ip.server";
import {
  CSRF_COOKIE,
  type IntakeSession,
  readCookie,
  readRemoteCsrf,
  readSession,
  sameSecret,
  SESSION_LIFETIME_MS,
  sessionSchema,
} from "./cookies.server";
import { expiredSession, unavailable } from "./errors.server";
import { requestUpstream } from "./upstream.server";

export {
  CSRF_COOKIE,
  encodeSession,
  getCookieNames,
  prepareCsrf,
  readCookie,
  readSession,
  sameSecret,
  SESSION_COOKIE,
  validateCsrf,
} from "./cookies.server";

const sessionEnvelopeSchema = z.strictObject({ data: sessionSchema });

export function createBootstrapKey(
  environment: BridgeEnvironment,
  origin: string,
  csrfNonce: string,
) {
  if (
    !environment.SHINHAN_BFF_STATE_SECRET ||
    !environment.SHINHAN_ALLOWED_ORIGINS.includes(origin) ||
    !/^[a-f0-9]{64}$/.test(csrfNonce)
  )
    throw unavailable();
  return createHmac("sha256", environment.SHINHAN_BFF_STATE_SECRET)
    .update(`shinhan-bootstrap:v1\n${environment.SHINHAN_APP_ENV}\n${origin}\n${csrfNonce}`)
    .digest("hex");
}

function validateApiExpiry(session: IntakeSession) {
  const expiresAt = Date.parse(session.expiresAt);
  if (expiresAt <= Date.now() || expiresAt > Date.now() + SESSION_LIFETIME_MS + 30000)
    throw unavailable();
  return expiresAt;
}

function localInitializationKey(environment: BridgeEnvironment, origin: string, csrf: string) {
  return createHmac("sha256", environment.SHINHAN_CLIENT_IP_HMAC_SECRET)
    .update(`initialize:${origin}:${csrf}`)
    .digest("hex");
}

interface SessionInitialization {
  promise: Promise<IntakeSession>;
  expiresAt: number;
}

// Local compatibility only. Remote retries are coordinated by the API's persisted bootstrap key.
const initializingSessions = new Map<string, SessionInitialization>();

async function initializeLocalSession(
  request: Request,
  environment: BridgeEnvironment,
  csrf: string,
  origin: string,
) {
  const key = localInitializationKey(environment, origin, csrf);
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
            clientKey: createClientKey(request, environment),
          },
          sessionEnvelopeSchema,
        );
        entry.expiresAt = validateApiExpiry(result.body.data);
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

export async function initializeSession(
  request: Request,
  environment: BridgeEnvironment,
  csrf: string,
  origin: string,
): Promise<IntakeSession & { replayed: boolean }> {
  const existing = readSession(request, environment, origin);
  if (existing) return { ...existing, replayed: false };
  if (environment.SHINHAN_APP_ENV === "local") {
    return {
      ...(await initializeLocalSession(request, environment, csrf, origin)),
      replayed: false,
    };
  }
  const currentCsrf = readRemoteCsrf(request, environment, origin);
  if (!currentCsrf || !sameSecret(csrf, currentCsrf.nonce)) throw expiredSession();
  const result = await requestUpstream(
    {
      environment,
      path: "sessions/bootstrap",
      method: "POST",
      expectedStatus: 201,
      body: {},
      clientKey: createClientKey(request, environment),
      sessionKey: createBootstrapKey(environment, origin, currentCsrf.nonce),
    },
    sessionEnvelopeSchema,
  );
  const expiresAt = Math.min(
    validateApiExpiry(result.body.data),
    Date.parse(currentCsrf.expiresAt),
  );
  if (expiresAt <= Date.now()) throw expiredSession();
  return {
    sessionToken: result.body.data.sessionToken,
    expiresAt: new Date(expiresAt).toISOString(),
    replayed: result.replayed,
  };
}

export function forgetInitialization(
  request: Request,
  environment: BridgeEnvironment,
  origin: string,
) {
  if (environment.SHINHAN_APP_ENV !== "local") return;
  try {
    const csrf = readCookie(request, CSRF_COOKIE);
    if (csrf) initializingSessions.delete(localInitializationKey(environment, origin, csrf));
  } catch {
    // Ambiguous cookies must not prevent clearing an expired session.
  }
}

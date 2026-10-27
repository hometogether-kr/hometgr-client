import "server-only";

import { createHmac, randomUUID } from "node:crypto";

import {
  BETA_MISSION_ID,
  BETA_SCHEMA_VERSION,
  type BetaCollectorInput,
  type BetaEventInput,
  type BetaEventResponse,
  betaEventResponseSchema,
} from "@/domains/beta-tracking";

import {
  type BetaTrackingEnvironment,
  isAllowedBetaCollectorUrl,
} from "../config/environment.server";
import { BetaTrackingFailure } from "./errors.server";
import { readBetaJson } from "./read-json.server";

interface BetaEventEnvelope {
  contract_version: typeof BETA_SCHEMA_VERSION;
  action: "record_event";
  timestamp: string;
  nonce: string;
  payload_json: string;
  signature: string;
}

interface EnvelopeOptions {
  timestamp?: string;
  nonce?: string;
}

export function createBetaEventEnvelope(
  payload: BetaCollectorInput,
  secret: string,
  options: EnvelopeOptions = {},
): BetaEventEnvelope {
  const envelope: Omit<BetaEventEnvelope, "signature"> = {
    contract_version: BETA_SCHEMA_VERSION,
    action: "record_event",
    timestamp: options.timestamp ?? String(Math.floor(Date.now() / 1000)),
    nonce: options.nonce ?? randomUUID(),
    payload_json: JSON.stringify(payload),
  };
  const signingInput = [
    envelope.contract_version,
    envelope.action,
    envelope.timestamp,
    envelope.nonce,
    envelope.payload_json,
  ].join("\n");
  return {
    ...envelope,
    signature: createHmac("sha256", Buffer.from(secret, "utf8"))
      .update(signingInput, "utf8")
      .digest("hex"),
  };
}

function collectorPayload(
  event: BetaEventInput,
  environment: BetaTrackingEnvironment,
): BetaCollectorInput {
  return {
    schema_version: event.schema_version,
    run_id: environment.BETA_RUN_ID,
    dataset: environment.BETA_DATASET,
    mission_id: BETA_MISSION_ID,
    event_id: event.event_id,
    attempt_id: event.attempt_id,
    anonymous_id: event.anonymous_id,
    event_name: event.event_name,
    role: event.role,
    occurred_at: event.occurred_at,
    utm_source: event.utm_source,
    utm_medium: event.utm_medium,
    utm_campaign: event.utm_campaign,
    utm_content: event.utm_content,
    flow_id: event.flow_id,
    completion_basis: event.completion_basis,
  };
}

function isContentRedirect(url: URL) {
  return (
    url.protocol === "https:" &&
    url.hostname === "script.googleusercontent.com" &&
    !url.port &&
    !url.username &&
    !url.password &&
    !url.hash &&
    url.pathname === "/macros/echo" &&
    Boolean(url.searchParams.get("user_content_key")) &&
    [...url.searchParams.keys()].every((key) => key === "user_content_key" || key === "lib")
  );
}

async function sendEnvelope(
  envelope: BetaEventEnvelope,
  environment: BetaTrackingEnvironment,
  signal: AbortSignal,
): Promise<BetaEventResponse> {
  const url = new URL(environment.BETA_TRACKING_WEB_APP_URL);
  if (!isAllowedBetaCollectorUrl(url, environment)) {
    throw new BetaTrackingFailure("COLLECTOR_UNAVAILABLE");
  }
  const body = JSON.stringify(envelope);
  if (Buffer.byteLength(body, "utf8") > 8192) {
    throw new BetaTrackingFailure("PAYLOAD_TOO_LARGE");
  }
  let response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    cache: "no-store",
    credentials: "omit",
    redirect: "manual",
    signal,
  });
  if ([302, 303].includes(response.status)) {
    const location = response.headers.get("location");
    if (environment.BETA_TRACKING_MODE !== "production" || !location) {
      throw new BetaTrackingFailure("COLLECTOR_UNAVAILABLE");
    }
    const target = new URL(location);
    if (!isContentRedirect(target)) throw new BetaTrackingFailure("COLLECTOR_UNAVAILABLE");
    await response.body?.cancel();
    response = await fetch(target, {
      method: "GET",
      cache: "no-store",
      credentials: "omit",
      redirect: "error",
      signal,
    });
  }
  if (response.status >= 300 && response.status < 400) {
    throw new BetaTrackingFailure("COLLECTOR_UNAVAILABLE");
  }
  if (!/^application\/json(?:\s*;.*)?$/i.test(response.headers.get("content-type") ?? "")) {
    throw new BetaTrackingFailure("COLLECTOR_UNAVAILABLE");
  }
  let rawResponse: unknown;
  try {
    rawResponse = await readBetaJson(response, 8192);
  } catch {
    throw new BetaTrackingFailure("COLLECTOR_UNAVAILABLE");
  }
  const parsed = betaEventResponseSchema.safeParse(rawResponse);
  if (!parsed.success || (parsed.data.ok && !response.ok)) {
    throw new BetaTrackingFailure("COLLECTOR_UNAVAILABLE");
  }
  return parsed.data;
}

export async function recordBetaEvent(
  event: BetaEventInput,
  environment: BetaTrackingEnvironment,
): Promise<Extract<BetaEventResponse, { ok: true }>> {
  const payload = collectorPayload(event, environment);
  const signal = AbortSignal.timeout(1200);
  try {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const envelope = createBetaEventEnvelope(payload, environment.BETA_EVENT_WRITE_SECRET);
      const result = await sendEnvelope(envelope, environment, signal);
      if (!result.ok) {
        if (["REPLAYED_ENVELOPE", "SIGNATURE_EXPIRED"].includes(result.error.code)) continue;
        throw new BetaTrackingFailure(result.error.code, result.error.retry_after_ms);
      }
      if (
        result.data.request_event_id !== event.event_id ||
        (result.data.status === "accepted" && result.data.event_id !== event.event_id)
      ) {
        throw new BetaTrackingFailure("COLLECTOR_UNAVAILABLE");
      }
      return result;
    }
  } catch (error) {
    if (error instanceof BetaTrackingFailure) throw error;
  }
  throw new BetaTrackingFailure("COLLECTOR_UNAVAILABLE");
}

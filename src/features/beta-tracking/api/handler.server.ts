import "server-only";

import { z } from "zod";

import { authenticateCloudflareIp } from "@/shared/api/cloudflare-ingress";

import { BETA_SCHEMA_VERSION, betaEventRequestSchema } from "@/domains/beta-tracking";

import {
  type BetaTrackingEnvironment,
  getBetaTrackingEnvironment,
} from "../config/environment.server";
import { recordBetaEvent } from "./collector.server";
import { BetaTrackingFailure } from "./errors.server";
import { readBetaJson } from "./read-json.server";

function validateBrowserRequest(request: Request, environment: BetaTrackingEnvironment) {
  const url = new URL(request.url);
  const origin = request.headers.get("origin");
  const configuredOrigin = environment.BETA_TRACKING_ALLOWED_ORIGINS.find((allowed) => {
    const expected = new URL(allowed);
    return expected.host === request.headers.get("host") && expected.protocol === url.protocol;
  });
  if (
    request.method !== "POST" ||
    url.pathname !== "/api/beta/events" ||
    url.search ||
    !configuredOrigin ||
    origin !== configuredOrigin ||
    request.headers.get("sec-fetch-site") !== "same-origin"
  ) {
    throw new BetaTrackingFailure("ORIGIN_REJECTED");
  }
  if (!/^application\/json(?:\s*;.*)?$/i.test(request.headers.get("content-type") ?? "")) {
    throw new BetaTrackingFailure("UNSUPPORTED_MEDIA_TYPE");
  }
}

function json(body: unknown, status: number) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Contract-Version": BETA_SCHEMA_VERSION,
      "X-Content-Type-Options": "nosniff",
      Vary: "Origin",
    },
  });
}

const versionSchema = z.object({
  event: z.object({ schema_version: z.string() }),
});

export async function handleBetaEvent(request: Request) {
  try {
    const environment = getBetaTrackingEnvironment();
    if (!environment) throw new BetaTrackingFailure("TRACKING_DISABLED");
    validateBrowserRequest(request, environment);
    if (environment.SHINHAN_CLIENT_IP_MODE === "cloudflare-vercel") {
      try {
        authenticateCloudflareIp(request.headers, {
          secret: environment.SHINHAN_CF_INGRESS_SECRET,
          keyHeader: "x-shinhan-ingress-key", ipHeader: "x-shinhan-visitor-ip",
        });
      } catch { throw new BetaTrackingFailure("INGRESS_UNAVAILABLE"); }
    }
    const raw = await readBetaJson(request, 4096);
    const version = versionSchema.safeParse(raw);
    if (version.success && version.data.event.schema_version !== BETA_SCHEMA_VERSION) {
      throw new BetaTrackingFailure("UNSUPPORTED_VERSION");
    }
    const parsed = betaEventRequestSchema.safeParse(raw);
    if (!parsed.success) throw new BetaTrackingFailure("INVALID_EVENT");
    if (parsed.data.context_id !== environment.BETA_TRACKING_CONTEXT_ID) {
      throw new BetaTrackingFailure("CONTEXT_MISMATCH");
    }
    const event = parsed.data.event;
    const expectedBasis =
      environment.BETA_DATASET === "connection_test" ? "simulation" : "saved_response";
    if (event.event_name === "beta_mission_complete" && event.completion_basis !== expectedBasis) {
      throw new BetaTrackingFailure("INVALID_EVENT");
    }
    const result = await recordBetaEvent(event, environment);
    return json(result, result.data.status === "accepted" ? 201 : 200);
  } catch (error) {
    const failure =
      error instanceof BetaTrackingFailure
        ? error
        : new BetaTrackingFailure("COLLECTOR_UNAVAILABLE");
    const response = json(failure.body, failure.status);
    if (failure.body.error.retry_after_ms !== null) {
      response.headers.set(
        "Retry-After",
        String(Math.ceil(failure.body.error.retry_after_ms / 1000)),
      );
    }
    return response;
  }
}

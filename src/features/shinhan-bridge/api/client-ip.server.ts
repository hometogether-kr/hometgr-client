import "server-only";

import { createHmac } from "node:crypto";

import { authenticateCloudflareIp, normalizeClientIp as normalizeIngressIp } from "@/shared/api/cloudflare-ingress";

import type { BridgeEnvironment } from "../config/environment.server";
import { unavailable } from "./errors.server";

export function normalizeClientIp(header: string | null) {
  try { return normalizeIngressIp(header); }
  catch { throw unavailable(); }
}

export function authenticateCloudflareClientIp(headers: Headers, environment: BridgeEnvironment) {
  if (environment.SHINHAN_CLIENT_IP_MODE !== "cloudflare-vercel") throw unavailable();
  try {
    return authenticateCloudflareIp(headers, {
      secret: environment.SHINHAN_CF_INGRESS_SECRET,
      keyHeader: "x-shinhan-ingress-key", ipHeader: "x-shinhan-visitor-ip",
    });
  } catch { throw unavailable(); }
}

export function createClientKey(request: Request, environment: BridgeEnvironment) {
  const hmac = createHmac("sha256", environment.SHINHAN_CLIENT_IP_HMAC_SECRET);
  if (environment.SHINHAN_APP_ENV === "local") {
    return hmac.update("local-client:loopback").digest("hex");
  }
  if (environment.SHINHAN_CLIENT_IP_MODE === "local" || process.env.VERCEL !== "1") {
    throw unavailable();
  }
  // The selected ingress has one IP source; forwarding headers never provide fallback.
  const normalizedIp =
    environment.SHINHAN_CLIENT_IP_MODE === "cloudflare-vercel"
      ? authenticateCloudflareClientIp(request.headers, environment)
      : normalizeClientIp(request.headers.get("x-vercel-forwarded-for"));
  return hmac
    .update(`shinhan-client:v1\n${environment.SHINHAN_APP_ENV}\n${normalizedIp}`)
    .digest("hex");
}

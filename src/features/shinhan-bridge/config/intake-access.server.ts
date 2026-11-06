import "server-only";

import { headers } from "next/headers";

import { getBridgeEnvironment } from "./environment.server";

export async function getShinhanSessionMode(): Promise<"local" | "remote" | "unavailable"> {
  const environment = getBridgeEnvironment();
  if (!environment) return "unavailable";
  const requestHeaders = await headers();
  const origin = environment.SHINHAN_ALLOWED_ORIGINS.find(
    (allowed) => new URL(allowed).host === requestHeaders.get("host"),
  );
  if (!origin) return "unavailable";
  if (environment.SHINHAN_APP_ENV === "local") {
    return requestHeaders.get("x-forwarded-proto") === new URL(origin).protocol.slice(0, -1)
      ? "local"
      : "unavailable";
  }
  // HTML/RSC receives no Cloudflare secret. This is readiness, not API authorization.
  if (requestHeaders.get("x-forwarded-proto") !== "https") return "unavailable";
  return "remote";
}

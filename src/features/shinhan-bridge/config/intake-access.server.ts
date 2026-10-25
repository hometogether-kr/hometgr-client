import "server-only";

import { headers } from "next/headers";

import { getBridgeEnvironment } from "./environment.server";

export async function getShinhanSessionMode(): Promise<"local" | "remote" | "unavailable"> {
  const environment = getBridgeEnvironment();
  if (!environment) return "unavailable";
  if (environment.SHINHAN_APP_ENV === "local") return "local";
  const host = (await headers()).get("host");
  return environment.SHINHAN_ALLOWED_ORIGINS.some((origin) => new URL(origin).host === host)
    ? "remote"
    : "unavailable";
}

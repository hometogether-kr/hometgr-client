import "server-only";

import { z } from "zod";

import {
  betaContextIdSchema,
  betaTimestampSchema,
  type BetaTrackingContext,
} from "@/domains/beta-tracking";

const originSchema = z
  .string()
  .url()
  .refine((value) => {
    if (!URL.canParse(value)) return false;
    const url = new URL(value);
    return (
      ["http:", "https:"].includes(url.protocol) &&
      url.origin === value &&
      !url.username &&
      !url.password
    );
  });

const collectorUrlSchema = z
  .string()
  .url()
  .refine((value) => {
    if (!URL.canParse(value)) return false;
    const url = new URL(value);
    return (
      ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash
    );
  });

const environmentSchema = z.object({
  SHINHAN_APP_ENV: z.enum(["local", "test", "dev", "production"]),
  SHINHAN_CLIENT_IP_MODE: z.enum(["local", "vercel-direct", "cloudflare-vercel"]),
  SHINHAN_CF_INGRESS_SECRET: z.string().optional(),
  BETA_TRACKING_ENABLED: z.literal("true"),
  BETA_TRACKING_MODE: z.enum(["local", "production"]),
  BETA_TRACKING_CONTEXT_ID: betaContextIdSchema,
  BETA_RUN_ID: betaContextIdSchema,
  BETA_DATASET: z.enum(["beta", "connection_test"]),
  BETA_START_AT: betaTimestampSchema,
  BETA_TRACKING_ALLOWED_ORIGINS: z
    .string()
    .transform((value) => value.split(",").map((origin) => origin.trim()))
    .pipe(z.array(originSchema).min(1).max(10)),
  BETA_TRACKING_API_URL: collectorUrlSchema,
  BETA_EVENT_WRITE_SECRET: z.string().min(32).max(256),
});

export type BetaTrackingEnvironment = z.infer<typeof environmentSchema>;

function isLoopback(url: URL) {
  return ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
}

export function isAllowedBetaCollectorUrl(url: URL, environment: BetaTrackingEnvironment) {
  const endpoint = environment.BETA_TRACKING_API_URL;
  if (url.href !== endpoint || url.username || url.password || url.search || url.hash) return false;
  if (url.pathname !== "/api/v1/beta/rpc") return false;
  if (environment.SHINHAN_APP_ENV === "local" || environment.SHINHAN_APP_ENV === "test") {
    return environment.BETA_TRACKING_MODE === "local" && environment.BETA_DATASET === "connection_test" &&
      /^http:\/\/(127\.0\.0\.1|localhost|\[::1\]):[1-9][0-9]{0,4}\/api\/v1\/beta\/rpc$/.test(endpoint);
  }
  const origin = environment.SHINHAN_APP_ENV === "dev"
    ? "https://dev-shinhan-api.hometogether.kr" : "https://shinhan-api.hometogether.kr";
  return environment.BETA_TRACKING_MODE === "production" && endpoint === origin + "/api/v1/beta/rpc";
}

function isAllowedRuntime(environment: BetaTrackingEnvironment) {
  const origins = environment.BETA_TRACKING_ALLOWED_ORIGINS.map((origin) => new URL(origin));
  if (environment.BETA_TRACKING_MODE === "local") {
    return (
      ((environment.SHINHAN_APP_ENV === "local" && process.env.NODE_ENV === "development") ||
        (environment.SHINHAN_APP_ENV === "test" && process.env.NODE_ENV === "test")) &&
      process.env.VERCEL !== "1" && environment.SHINHAN_CLIENT_IP_MODE === "local" &&
      environment.BETA_DATASET === "connection_test" &&
      origins.every((origin) => origin.protocol === "http:" && isLoopback(origin))
    );
  }
  if (
    !["dev", "production"].includes(environment.SHINHAN_APP_ENV) ||
    process.env.NODE_ENV !== "production" || process.env.VERCEL !== "1" ||
    process.env.VERCEL_ENV !== (environment.SHINHAN_APP_ENV === "production" ? "production" : "preview") ||
    environment.SHINHAN_CLIENT_IP_MODE === "local" ||
    !origins.every((origin) => origin.protocol === "https:" && !isLoopback(origin)) ||
    environment.BETA_EVENT_WRITE_SECRET === "PUBLIC_SYNTHETIC_FIXTURE_KEY_DO_NOT_USE" ||
    environment.BETA_EVENT_WRITE_SECRET.startsWith("synthetic-")
  ) return false;
  if (environment.SHINHAN_CLIENT_IP_MODE === "cloudflare-vercel") {
    const secret = environment.SHINHAN_CF_INGRESS_SECRET;
    return environment.SHINHAN_APP_ENV === "production" && !!secret && secret.length === 64 && /^[a-f0-9]{64}$/.test(secret) &&
      secret !== environment.BETA_EVENT_WRITE_SECRET &&
      origins.every((origin) => ["https://hometogether.kr", "https://www.hometogether.kr"].includes(origin.origin));
  }
  return true;
}

export function getBetaTrackingEnvironment(): BetaTrackingEnvironment | null {
  const parsed = environmentSchema.safeParse(process.env);
  if (!parsed.success) return null;
  const environment = parsed.data;
  if (Date.now() < Date.parse(environment.BETA_START_AT)) return null;
  if (
    !isAllowedRuntime(environment) ||
    !isAllowedBetaCollectorUrl(new URL(environment.BETA_TRACKING_API_URL), environment)
  ) {
    return null;
  }

  // Collection is continuous; stopping it requires explicitly disabling tracking.
  // Run/context remain stable when the aggregate's rolling calendar period changes.
  return environment;
}

export function getBetaTrackingContext(): BetaTrackingContext | null {
  const environment = getBetaTrackingEnvironment();
  if (!environment) return null;
  return {
    context_id: environment.BETA_TRACKING_CONTEXT_ID,
    completion_basis:
      environment.BETA_DATASET === "connection_test" ? "simulation" : "saved_response",
  };
}

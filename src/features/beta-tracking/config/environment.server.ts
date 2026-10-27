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
  BETA_TRACKING_WEB_APP_URL: collectorUrlSchema,
  BETA_EVENT_WRITE_SECRET: z.string().min(32).max(256),
});

export type BetaTrackingEnvironment = z.infer<typeof environmentSchema>;

function isLoopback(url: URL) {
  return ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
}

export function isAllowedBetaCollectorUrl(url: URL, environment: BetaTrackingEnvironment) {
  if (url.username || url.password || url.search || url.hash) return false;
  if (environment.BETA_TRACKING_MODE === "local") {
    return (
      environment.BETA_DATASET === "connection_test" && url.protocol === "http:" && isLoopback(url)
    );
  }
  return (
    url.protocol === "https:" &&
    url.hostname === "script.google.com" &&
    !url.port &&
    /^\/macros\/s\/[a-zA-Z0-9_-]+\/exec$/.test(url.pathname)
  );
}

function isAllowedRuntime(environment: BetaTrackingEnvironment) {
  const origins = environment.BETA_TRACKING_ALLOWED_ORIGINS.map((origin) => new URL(origin));
  if (environment.BETA_TRACKING_MODE === "local") {
    return (
      process.env.NODE_ENV === "development" &&
      process.env.VERCEL !== "1" &&
      environment.BETA_DATASET === "connection_test" &&
      origins.every((origin) => origin.protocol === "http:" && isLoopback(origin))
    );
  }
  return (
    process.env.NODE_ENV === "production" &&
    origins.every((origin) => origin.protocol === "https:" && !isLoopback(origin)) &&
    environment.BETA_EVENT_WRITE_SECRET !== "PUBLIC_SYNTHETIC_FIXTURE_KEY_DO_NOT_USE" &&
    !environment.BETA_EVENT_WRITE_SECRET.startsWith("synthetic-")
  );
}

export function getBetaTrackingEnvironment(): BetaTrackingEnvironment | null {
  const parsed = environmentSchema.safeParse(process.env);
  if (!parsed.success) return null;
  const environment = parsed.data;
  if (Date.now() < Date.parse(environment.BETA_START_AT)) return null;
  if (
    !isAllowedRuntime(environment) ||
    !isAllowedBetaCollectorUrl(new URL(environment.BETA_TRACKING_WEB_APP_URL), environment)
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

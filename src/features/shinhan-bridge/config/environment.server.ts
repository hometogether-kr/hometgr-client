import "server-only";

import { z } from "zod";

const originSchema = z
  .string()
  .url()
  .refine((value) => {
    const url = new URL(value);
    return (
      ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash &&
      !url.hostname.includes("*") &&
      url.origin === value
    );
  });

const bridgeEnvironmentSchema = z.object({
  SHINHAN_APP_ENV: z.enum(["local", "dev", "production"]),
  SHINHAN_CLIENT_IP_MODE: z.enum(["local", "vercel-direct"]),
  SHINHAN_API_ORIGIN: originSchema,
  SHINHAN_BRIDGE_SECRET: z.string().min(32),
  SHINHAN_CLIENT_IP_HMAC_SECRET: z.string().min(32),
  SHINHAN_BFF_STATE_SECRET: z.string().min(32).optional(),
  SHINHAN_ALLOWED_ORIGINS: z
    .string()
    .transform((value) => value.split(","))
    .pipe(z.array(originSchema).min(1).max(10)),
});

export type BridgeEnvironment = z.infer<typeof bridgeEnvironmentSchema>;

export function getBridgeEnvironment(): BridgeEnvironment | null {
  const result = bridgeEnvironmentSchema.safeParse(process.env);
  if (!result.success) return null;
  const environment = result.data;
  const isLoopback = (origin: string) =>
    ["localhost", "127.0.0.1", "[::1]"].includes(new URL(origin).hostname);
  if (environment.SHINHAN_APP_ENV === "local") {
    const origins = [environment.SHINHAN_API_ORIGIN, ...environment.SHINHAN_ALLOWED_ORIGINS];
    return process.env.NODE_ENV === "development" &&
      environment.SHINHAN_CLIENT_IP_MODE === "local" &&
      origins.every(isLoopback)
      ? environment
      : null;
  }
  const deploymentEnvironment =
    environment.SHINHAN_APP_ENV === "production" ? "production" : "preview";
  const apiOrigin =
    environment.SHINHAN_APP_ENV === "production"
      ? "https://shinhan-api.hometogether.kr"
      : "https://dev-shinhan-api.hometogether.kr";
  // Each Vercel target connects only to its matching API. Proxy ingress requires its own contract.
  if (
    process.env.VERCEL !== "1" ||
    process.env.VERCEL_ENV !== deploymentEnvironment ||
    environment.SHINHAN_CLIENT_IP_MODE !== "vercel-direct" ||
    environment.SHINHAN_API_ORIGIN !== apiOrigin
  )
    return null;
  if (
    !environment.SHINHAN_BFF_STATE_SECRET ||
    Buffer.byteLength(environment.SHINHAN_BFF_STATE_SECRET, "utf8") < 32 ||
    environment.SHINHAN_BFF_STATE_SECRET === environment.SHINHAN_CLIENT_IP_HMAC_SECRET ||
    environment.SHINHAN_BFF_STATE_SECRET === environment.SHINHAN_BRIDGE_SECRET ||
    environment.SHINHAN_CLIENT_IP_HMAC_SECRET === environment.SHINHAN_BRIDGE_SECRET ||
    !environment.SHINHAN_ALLOWED_ORIGINS.every((origin) => {
      const url = new URL(origin);
      return url.protocol === "https:" && url.hostname.endsWith(".vercel.app") && !url.port;
    })
  )
    return null;
  return environment;
}

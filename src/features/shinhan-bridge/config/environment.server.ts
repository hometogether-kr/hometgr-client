import "server-only";

import { z } from "zod";

const loopbackOriginSchema = z
  .string()
  .url()
  .refine((value) => {
    const url = new URL(value);
    return (
      ["http:", "https:"].includes(url.protocol) &&
      ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) &&
      url.origin === value
    );
  });

const bridgeEnvironmentSchema = z.object({
  // Keep legacy local settings valid; explicit remote settings must never fall back to local.
  // Remote activation waits for bootstrap deployment and registered consent documents.
  SHINHAN_APP_ENV: z.literal("local").optional(),
  SHINHAN_CLIENT_IP_MODE: z.literal("local").optional(),
  SHINHAN_API_ORIGIN: loopbackOriginSchema,
  SHINHAN_BRIDGE_SECRET: z.string().min(32),
  SHINHAN_CLIENT_IP_HMAC_SECRET: z.string().min(32),
  SHINHAN_ALLOWED_ORIGINS: z
    .string()
    .transform((value) => value.split(","))
    .pipe(z.array(loopbackOriginSchema).min(1).max(10)),
});

export type BridgeEnvironment = z.infer<typeof bridgeEnvironmentSchema>;

export function getBridgeEnvironment(): BridgeEnvironment | null {
  // Local consent snapshots and process-local session serialization are not a production boundary.
  if (process.env.NODE_ENV !== "development") return null;
  const result = bridgeEnvironmentSchema.safeParse(process.env);
  return result.success ? result.data : null;
}

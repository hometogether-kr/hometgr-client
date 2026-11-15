import { z } from "zod";

export const HOST_FLYER_PATH = "/intro/host";
export const HOST_FLYER_ORIGIN = "https://hometogether.kr";
export const HOST_FLYER_HEADER = "x-host-flyer-attribution";
export const HOST_FLYER_RETURN_PARAM = "flyer_resume";
export const HOST_FLYER_RETURN_COOKIE = "ht_flyer_oauth";
export const HOST_FLYER_AUTH_TTL_SECONDS = 1800;

export const hostFlyerEntryIdSchema = z.uuid();

export function parseHostFlyerEntryId(value: unknown): string | null {
  const result = hostFlyerEntryIdSchema.safeParse(value);
  return result.success ? result.data : null;
}

const campaign = {
  utm_source: "apartment_flyer",
  utm_medium: "print",
  utm_campaign: "host_a4_202611",
} as const;

export const flyerContentSchema = z
  .string()
  .regex(/^(general|apt[0-9]{3,6}|flyer_v[1-9][0-9]{0,2})$/);

export const hostFlyerAttributionSchema = z.strictObject({
  utm_source: z.literal(campaign.utm_source),
  utm_medium: z.literal(campaign.utm_medium),
  utm_campaign: z.literal(campaign.utm_campaign),
  utm_content: flyerContentSchema,
  landing_path: z.literal(HOST_FLYER_PATH),
});

export type HostFlyerAttribution = z.infer<typeof hostFlyerAttributionSchema>;

const crmFlyerAttributionSchema = hostFlyerAttributionSchema.extend({
  first_landed_at: z.iso.datetime(),
});

type CrmFlyerAttribution = z.infer<typeof crmFlyerAttributionSchema>;

export function buildHostFlyerUrl(utmContent: string, origin = HOST_FLYER_ORIGIN): URL {
  const url = new URL(HOST_FLYER_PATH, origin);
  url.search = new URLSearchParams({
    ...campaign,
    utm_content: flyerContentSchema.parse(utmContent),
  }).toString();
  return url;
}

export function readHostFlyerUrl(url: URL): HostFlyerAttribution | null {
  if (url.pathname !== HOST_FLYER_PATH) return null;

  const keys = [...Object.keys(campaign), "utm_content"];
  const fields = Object.fromEntries(
    keys.map((key) => {
      const values = url.searchParams.getAll(key);
      return [key, values.length === 1 ? values[0] : undefined];
    }),
  );
  const parsed = hostFlyerAttributionSchema.safeParse({ ...fields, landing_path: url.pathname });
  return parsed.success ? parsed.data : null;
}

export function readHostFlyerHeader(header: string | null): CrmFlyerAttribution | null {
  if (!header || header.length > 320) return null;
  try {
    const value: unknown = JSON.parse(header);
    const parsed = crmFlyerAttributionSchema.safeParse(value);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

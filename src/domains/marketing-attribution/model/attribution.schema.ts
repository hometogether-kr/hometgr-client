import { z } from "zod";

import { MARKETING_SOURCES, TRACKING_EVENT_NAMES } from "./attribution";

const optionalText = (maximumLength: number) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(maximumLength).optional(),
  );

const optionalUrl = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().url().max(2_048).optional(),
);

/** The browser-to-server contract; no unlisted fields are accepted. */
export const attributionEventInputSchema = z
  .object({
    event_id: z.string().uuid(),
    source: z.enum(MARKETING_SOURCES),
    campaign: optionalText(160),
    event_name: z.enum(TRACKING_EVENT_NAMES),
    landing_url: optionalUrl,
    referrer: optionalUrl,
    utm_source: optionalText(160),
    utm_medium: optionalText(160),
    utm_campaign: optionalText(160),
    utm_content: optionalText(300),
    utm_term: optionalText(300),
    anonymous_id: z.string().uuid(),
    session_id: z.string().uuid(),
    device_type: z.enum(["mobile", "tablet", "desktop", "unknown"]),
  })
  .strict();

export type AttributionEventInput = z.infer<typeof attributionEventInputSchema>;
export type AttributionEventRecord = AttributionEventInput & { created_at: string };

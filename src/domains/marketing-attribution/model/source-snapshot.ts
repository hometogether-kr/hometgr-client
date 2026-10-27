import { z } from "zod";

const approvedTuples = [
  ["apartment", "qr", "host_acq_2026q4", "ad_01"],
  ["kakao", "social", "host_acq_2026q4", "host"],
  ["everytime", "referral", "guest_acq_2026q4", "seoultech"],
  ["everytime", "referral", "guest_acq_2026q4", "union"],
  ["instagram", "social", "guest_acq_2026q4", "profile"],
  ["kakao", "social", "guest_acq_2026q4", "guest"],
] as const;

const tupleSchema = z.strictObject({
  utm_source: z.string().max(64),
  utm_medium: z.string().max(64),
  utm_campaign: z.string().max(64),
  utm_content: z.string().max(64),
});

export const approvedExternalAttributionSchema = tupleSchema.refine((value) =>
  approvedTuples.some(
    ([source, medium, campaign, content]) =>
      value.utm_source === source &&
      value.utm_medium === medium &&
      value.utm_campaign === campaign &&
      value.utm_content === content,
  ),
);

export const marketingAttributionSnapshotSchema = tupleSchema.refine(
  (value) =>
    approvedExternalAttributionSchema.safeParse(value).success ||
    Object.values(value).every((part) => part === "") ||
    ((value.utm_source === "google" || value.utm_source === "naver") &&
      value.utm_medium === "organic" &&
      value.utm_campaign === "" &&
      value.utm_content === ""),
);

export type MarketingAttributionSnapshot = z.infer<typeof marketingAttributionSnapshotSchema>;

export const EMPTY_MARKETING_ATTRIBUTION: MarketingAttributionSnapshot = {
  utm_source: "",
  utm_medium: "",
  utm_campaign: "",
  utm_content: "",
};

export const MARKETING_STATE_MAX_AGE_MS = 7_776_000_000;
export const storedMarketingAttributionSchema = z.strictObject({
  version: z.literal(2),
  created_at: z.number().int().nonnegative(),
  first: marketingAttributionSnapshotSchema,
  latest: marketingAttributionSnapshotSchema,
});

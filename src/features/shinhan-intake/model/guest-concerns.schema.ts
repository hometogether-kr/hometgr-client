import { z } from "zod";

export const guestConcernCodeSchema = z.enum([
  "PRIVACY",
  "HOST_RELATIONSHIP",
  "HOUSE_RULES",
  "CLEANING_NOISE",
  "COST_CONTRACT",
  "GETTING_STARTED",
]);

export type GuestConcernCode = z.infer<typeof guestConcernCodeSchema>;

export const guestConcernResponseSchema = z.object({
  codes: z
    .array(guestConcernCodeSchema)
    .max(6, "걱정 항목은 최대 6개까지 선택할 수 있어요.")
    .transform((codes) => [...new Set(codes)]),
  optionalConsent: z
    .boolean()
    .nullable()
    .refine((agreed) => agreed === true, "걱정 항목 수집·이용에 동의해 주세요."),
});

import { z } from "zod";

import {
  shinhanConsentVersionSchema,
  shinhanGuestBudgetInputSchema,
  shinhanGuestConcernCodeSchema,
  shinhanGuestDemandInputSchema,
  shinhanHostConcernCodeSchema,
  shinhanHostEstimateInputSchema,
  shinhanHostRegistrationInputSchema,
  shinhanPhoneSchema,
} from "@/domains/shinhan-application";

const agreedConsentSchema = z.strictObject({
  agreed: z.literal(true),
  version: shinhanConsentVersionSchema,
});
const commonInput = { phone: shinhanPhoneSchema, requiredConsent: agreedConsentSchema };

export const shinhanCreateApplicationInputSchema = z.discriminatedUnion("applicationType", [
  z.strictObject({
    ...commonInput,
    applicationType: z.literal("HOST_REGISTRATION"),
    input: shinhanHostRegistrationInputSchema,
  }),
  z.strictObject({
    ...commonInput,
    applicationType: z.literal("HOST_ESTIMATE"),
    input: shinhanHostEstimateInputSchema,
  }),
  z.strictObject({
    ...commonInput,
    applicationType: z.literal("GUEST_BUDGET"),
    input: shinhanGuestBudgetInputSchema,
  }),
  z.strictObject({
    ...commonInput,
    applicationType: z.literal("GUEST_DEMAND"),
    input: shinhanGuestDemandInputSchema,
  }),
]);

const concernCodeSchema = z.union([shinhanHostConcernCodeSchema, shinhanGuestConcernCodeSchema]);
export const shinhanConcernsInputSchema = z.discriminatedUnion("state", [
  z.strictObject({ state: z.literal("SKIPPED") }),
  z.strictObject({
    state: z.literal("SUBMITTED"),
    concernCodes: z.array(concernCodeSchema).max(6),
    optionalConsent: agreedConsentSchema,
  }),
]);

export type ShinhanCreateApplicationInput = z.infer<typeof shinhanCreateApplicationInputSchema>;
export type ShinhanConcernsInput = z.infer<typeof shinhanConcernsInputSchema>;

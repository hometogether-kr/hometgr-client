import { z } from "zod";

const text = (max: number) => z.string().min(1).max(max);
const budgetSchema = z.number().int().min(200000).max(1000000).multipleOf(10000);
const timestampSchema = z.iso.datetime({ offset: true });

export const shinhanApplicationIdSchema = z.uuid();
export const shinhanConsentVersionSchema = text(100);
export const shinhanPhoneSchema = z.string().regex(/^010\d{8}$/);
export const shinhanHostConcernCodeSchema = z.enum([
  "YOUNG_PERSON",
  "LIFESTYLE",
  "PRIVACY",
  "RENT_MANAGEMENT",
  "PROCESS",
  "UNSURE",
]);
export const shinhanGuestConcernCodeSchema = z.enum([
  "PRIVACY",
  "HOST_RELATIONSHIP",
  "HOUSE_RULES",
  "CLEANING_NOISE",
  "COST_CONTRACT",
  "GETTING_STARTED",
]);

export const shinhanHostRegistrationInputSchema = z.strictObject({
  ownership: z.enum(["OWNED", "RENTED"]),
  areaRaw: text(200),
});

const furnitureStateSchema = z.enum(["OWNED", "PLANNED", "NONE"]);
export const shinhanHostEstimateInputSchema = z.strictObject({
  address: z.strictObject({
    addressSource: z.literal("KAKAO_POSTCODE"),
    addressRaw: text(300),
    sido: text(30),
    sigungu: z.string().max(50),
  }),
  buildingDong: z.string().max(40).nullable().optional(),
  unitHo: z.string().max(40).nullable().optional(),
  furniture: z.strictObject({
    bed: furnitureStateSchema,
    desk: furnitureStateSchema,
    chair: furnitureStateSchema,
    wardrobe: furnitureStateSchema,
  }),
  bathroomCount: z.union([z.literal(1), z.literal(2)]),
});

export const shinhanGuestBudgetInputSchema = z.strictObject({
  budgetMonthlyKrw: budgetSchema,
  desiredRegionRaw: text(200),
  moveInDate: z.iso.date(),
});

export const shinhanGuestDemandInputSchema = z
  .strictObject({
    desiredRegionRaw: text(200),
    budgetMinKrw: budgetSchema,
    budgetMaxKrw: budgetSchema,
    moveInDate: z.iso.date(),
    contractTermCode: z.enum([
      "MONTH_1",
      "MONTH_2",
      "MONTH_3",
      "MONTH_4",
      "MONTH_5",
      "MONTH_6",
      "MONTH_7",
      "MONTH_8",
      "MONTH_9",
      "MONTH_10",
      "MONTH_11",
      "MONTH_12",
      "MONTHS_12_PLUS",
    ]),
    gender: z.enum(["FEMALE", "MALE"]),
  })
  .refine((input) => input.budgetMinKrw <= input.budgetMaxKrw, {
    path: ["budgetMaxKrw"],
    message: "최대 월세는 최소 월세 이상이어야 합니다.",
  });

const moneyRangeSchema = z.object({ min: z.number().int(), max: z.number().int() });
export const shinhanEstimateDtoSchema = z.object({
  rulesVersion: z.string().min(1),
  region: z.object({
    source: z.enum(["district", "seoul_config_average"]),
    districtUsed: z.string().nullable(),
    fallbackReason: z.enum(["outside_seoul_or_unsupported", "district_unresolved"]).nullable(),
    baseMonthlyWon: moneyRangeSchema,
  }),
  adjustmentWon: z.number().int(),
  rawMonthlyWon: moneyRangeSchema,
  monthlyWon: moneyRangeSchema,
  annualWon: moneyRangeSchema,
  plannedFurnitureKeys: z.array(z.string()),
});

const recordedConsentSchema = z.object({
  agreed: z.boolean(),
  version: shinhanConsentVersionSchema.nullable(),
  recordedAt: timestampSchema,
});
const notificationSchema = z.object({
  state: z.enum(["NOT_REQUESTED", "PENDING", "ACCEPTED", "DELIVERED", "FAILED", "UNKNOWN"]),
  deliveredAt: timestampSchema.nullable(),
});

function concernResponseSchema<T extends z.ZodType<string>>(codeSchema: T) {
  return z.discriminatedUnion("state", [
    z.object({
      state: z.literal("NOT_SUBMITTED"),
      codes: z.array(codeSchema).length(0),
      consent: z.null(),
    }),
    z.object({
      state: z.literal("SUBMITTED"),
      codes: z.array(codeSchema).max(6),
      consent: recordedConsentSchema.extend({
        agreed: z.literal(true),
        version: shinhanConsentVersionSchema,
      }),
    }),
    z.object({
      state: z.literal("SKIPPED"),
      codes: z.array(codeSchema).length(0),
      consent: recordedConsentSchema.extend({ agreed: z.literal(false) }),
    }),
  ]);
}

const commonApplication = {
  applicationId: shinhanApplicationIdSchema,
  campaign: z.literal("shinhan"),
  phone: shinhanPhoneSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
  version: z.number().int().min(1),
  requiredConsent: recordedConsentSchema.extend({
    agreed: z.literal(true),
    version: shinhanConsentVersionSchema,
  }),
  notification: notificationSchema,
};

export const shinhanApplicationDtoSchema = z.discriminatedUnion("applicationType", [
  z.object({
    ...commonApplication,
    applicationType: z.literal("HOST_REGISTRATION"),
    input: shinhanHostRegistrationInputSchema,
    concerns: z.object({
      state: z.literal("NOT_SUBMITTED"),
      codes: z.array(z.string()).length(0),
      consent: z.null(),
    }),
    estimate: z.null(),
    exampleContentVersion: z.null(),
    introductionRequestedAt: z.null(),
  }),
  z.object({
    ...commonApplication,
    applicationType: z.literal("HOST_ESTIMATE"),
    input: shinhanHostEstimateInputSchema,
    concerns: concernResponseSchema(shinhanHostConcernCodeSchema),
    estimate: shinhanEstimateDtoSchema,
    exampleContentVersion: z.null(),
    introductionRequestedAt: timestampSchema.nullable(),
  }),
  z.object({
    ...commonApplication,
    applicationType: z.literal("GUEST_BUDGET"),
    input: shinhanGuestBudgetInputSchema,
    concerns: concernResponseSchema(shinhanGuestConcernCodeSchema),
    estimate: z.null(),
    exampleContentVersion: z.literal("common-space-v1"),
    introductionRequestedAt: z.null(),
  }),
  z.object({
    ...commonApplication,
    applicationType: z.literal("GUEST_DEMAND"),
    input: shinhanGuestDemandInputSchema,
    concerns: concernResponseSchema(shinhanGuestConcernCodeSchema),
    estimate: z.null(),
    exampleContentVersion: z.literal("common-space-v1"),
    introductionRequestedAt: z.null(),
  }),
]);

export const shinhanApplicationResponseSchema = z.object({ data: shinhanApplicationDtoSchema });
export type ShinhanApplicationDto = z.infer<typeof shinhanApplicationDtoSchema>;
export type ShinhanEstimate = z.infer<typeof shinhanEstimateDtoSchema>;
export type ShinhanHostConcernCode = z.infer<typeof shinhanHostConcernCodeSchema>;
export type ShinhanGuestConcernCode = z.infer<typeof shinhanGuestConcernCodeSchema>;

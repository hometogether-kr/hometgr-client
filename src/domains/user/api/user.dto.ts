import { z } from "zod";

import { CONSENT_KEYS } from "../model/consent";

/** OpenAPI: UserRole */
export const userRoleDtoSchema = z.enum([
  "student",
  "host",
  "admin",
  "superAdmin",
  "roomManager",
  "reservationManager",
  "paymentManager",
  "csManager",
]);

/** OpenAPI: UserProfileResponseDto */
export const userProfileDtoSchema = z.object({
  id: z.uuid(),
  role: userRoleDtoSchema,
  name: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  introduction: z.string().nullable(),
  onboardingCompletedAt: z.string().nullable(),
});

export type UserProfileDto = z.infer<typeof userProfileDtoSchema>;

/** OpenAPI: ConsentKey */
export const consentKeyDtoSchema = z.enum(CONSENT_KEYS);

export type ConsentKeyDto = z.infer<typeof consentKeyDtoSchema>;

/** OpenAPI: ConsentStateItemResponseDto */
export const consentStateItemDtoSchema = z.object({
  key: consentKeyDtoSchema,
  agreed: z.boolean(),
  policyVersion: z.string().nullable(),
  required: z.boolean(),
  agreedAt: z.string().nullable(),
});

export type ConsentStateItemDto = z.infer<typeof consentStateItemDtoSchema>;

/** OpenAPI: MeConsentsResponseDto */
export const meConsentsDtoSchema = z.object({
  items: z.array(consentStateItemDtoSchema),
  requiredSatisfied: z.boolean(),
});

export type MeConsentsDto = z.infer<typeof meConsentsDtoSchema>;

/** OpenAPI: StudentMeResponseDto */
export const studentMeDtoSchema = z.object({
  school: z.string().nullable(),
  major: z.string().nullable(),
  studentType: z
    .enum(["undergraduate", "graduate", "internationalStudent", "exchangeStudent", "other"])
    .nullable(),
  verificationStatus: z.enum(["unverified", "pending", "verified", "rejected"]),
  studentCardImageUrl: z.string().nullable(),
  preferredMoveInDate: z.string().nullable(),
  preferredStayMonths: z.number().int().nullable(),
});

/** OpenAPI: MeResponseDto */
export const meResponseDtoSchema = z.object({
  onboardingRequired: z.boolean(),
  user: userProfileDtoSchema,
  student: studentMeDtoSchema.nullable(),
  consents: meConsentsDtoSchema.nullable(),
});

export type MeResponseDto = z.infer<typeof meResponseDtoSchema>;

/** OpenAPI: AuthOwnerResponseDto — 카카오 콜백이 돌려주는 로그인 결과 */
export const authOwnerResponseDtoSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  onboardingRequired: z.boolean(),
  user: userProfileDtoSchema,
});

export type AuthOwnerResponseDto = z.infer<typeof authOwnerResponseDtoSchema>;

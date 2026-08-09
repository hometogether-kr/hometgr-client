import { z } from "zod";

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
export const consentKeyDtoSchema = z.enum([
  "termsOfService",
  "privacyCollection",
  "privacyThirdParty",
  "locationBasedServiceTerms",
  "roomPublication",
  "noFraudPledge",
  "alimtalkOptIn",
  "econtractAgreement",
  "careServiceMarketing",
  "marketingOptIn",
  "paymentRefundPolicy",
  "kakaoChannelOptIn",
]);

export type ConsentKeyDto = z.infer<typeof consentKeyDtoSchema>;

/** OpenAPI: ConsentStateItemResponseDto */
export const consentStateItemDtoSchema = z.object({
  key: consentKeyDtoSchema,
  agreed: z.boolean(),
  policyVersion: z.string().nullable(),
  required: z.boolean(),
  agreedAt: z.string().nullable(),
});

/** OpenAPI: MeConsentsResponseDto */
export const meConsentsDtoSchema = z.object({
  items: z.array(consentStateItemDtoSchema),
  requiredSatisfied: z.boolean(),
});

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

/** OpenAPI: PutMeResponseDto — 온보딩 완료 후 새 토큰과 현재 프로필 */
export const putMeResponseDtoSchema = authOwnerResponseDtoSchema.extend({
  student: studentMeDtoSchema.nullable(),
  consents: meConsentsDtoSchema.nullable(),
});

export type PutMeResponseDto = z.infer<typeof putMeResponseDtoSchema>;

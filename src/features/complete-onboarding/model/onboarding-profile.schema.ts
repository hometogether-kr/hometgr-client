import { z } from "zod";

import { formatKoreanPhone } from "@/shared/lib/korean-phone";

export interface OnboardingProfileValues {
  name: string;
  phone: string;
}

export const onboardingProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "이름을 입력해주세요.")
    .max(100, "이름은 100자 이내로 입력해주세요."),
  phone: z
    .string()
    .trim()
    .refine((value) => formatKoreanPhone(value) !== null, "올바른 휴대폰 번호를 입력해주세요."),
});

export const completeOnboardingInputSchema = onboardingProfileSchema.extend({
  email: z.email().max(320),
  marketingOptIn: z.boolean(),
});

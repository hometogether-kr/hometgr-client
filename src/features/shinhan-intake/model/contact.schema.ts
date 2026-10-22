import { z } from "zod";

export const shinhanContactSchema = z.object({
  phone: z
    .string()
    .transform((value) => value.replace(/[\s-]/g, ""))
    .pipe(z.string().regex(/^010\d{8}$/, "010으로 시작하는 휴대폰 번호 11자리를 입력해 주세요.")),
  requiredConsent: z.boolean().refine((value) => value, "개인정보 수집·이용에 동의해 주세요."),
});

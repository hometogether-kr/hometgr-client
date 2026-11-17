import { z } from "zod";

export const FIRST_BIRTH_YEAR = 1940;

const emailSchema = z.email();

export function createSignupFormSchema(currentYear: number) {
  return z.object({
    name: z.string().trim().min(1, "이름을 입력해 주세요"),
    phone: z
      .tuple([z.string(), z.string(), z.string()])
      .refine(
        (parts) => /^01[016789]\d{7,8}$/.test(parts.join("")),
        "연락처를 올바르게 입력해 주세요",
      ),
    birthYear: z.string().refine((value) => {
      const year = Number(value);
      return /^\d{4}$/.test(value) && year >= FIRST_BIRTH_YEAR && year <= currentYear;
    }, "출생연도를 선택해 주세요"),
    gender: z.enum(["male", "female"], { error: "성별을 선택해 주세요" }),
    email: z
      .string()
      .trim()
      .refine(
        (value) => value === "" || emailSchema.safeParse(value).success,
        "이메일 주소를 올바르게 입력해 주세요",
      ),
  });
}

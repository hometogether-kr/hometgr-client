import { z } from "zod";

export const guestRegionFormSchema = z.object({
  region: z
    .string()
    .trim()
    .min(1, "찾고 싶은 동네나 학교를 입력해 주세요.")
    .max(100, "100자 이내로 입력해 주세요."),
});

export interface GuestRegionFormValues {
  region: string;
}

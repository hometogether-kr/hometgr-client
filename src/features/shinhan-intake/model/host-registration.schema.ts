import { z } from "zod";

export const shinhanHostRegistrationSchema = z.object({
  ownership: z.enum(["OWNED", "RENTED"], { error: "집의 자가 여부를 선택해 주세요." }),
  areaRaw: z
    .string()
    .trim()
    .min(1, "집의 대략적인 위치를 입력해 주세요.")
    .max(200, "위치는 200자 이내로 입력해 주세요."),
});

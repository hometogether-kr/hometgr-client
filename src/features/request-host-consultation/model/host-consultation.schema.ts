import { z } from "zod";

import { formatKoreanPhone } from "@/shared/lib/korean-phone";

export const hostConsultationFormSchema = z.object({
  regionType: z.enum(["university", "station"]),
  regionId: z.string().min(1, "지역을 선택해 주세요."),
  roomCount: z.enum(["1", "2", "3_PLUS"], { error: "방 개수를 선택해 주세요." }),
  airConditioner: z.enum(["yes", "no"], { error: "에어컨 유무를 선택해 주세요." }),
  tenure: z.enum(["owned", "rented"], { error: "주택 형태를 선택해 주세요." }),
  phone: z
    .string()
    .refine((value) => formatKoreanPhone(value) !== null, "올바른 휴대전화 번호를 입력해 주세요."),
  consent: z.literal(true, { error: "개인정보 수집·이용에 동의해 주세요." }),
});

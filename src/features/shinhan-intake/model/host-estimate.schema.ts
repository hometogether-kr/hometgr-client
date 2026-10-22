import { z } from "zod";

const furnitureStateSchema = z
  .enum(["OWNED", "PLANNED", "NONE"])
  .nullable()
  .refine((value) => value !== null, "가구 준비 상태를 선택해 주세요.");

export const shinhanHostEstimateSchema = z.object({
  address: z
    .object({
      addressSource: z.literal("KAKAO_POSTCODE"),
      addressRaw: z.string().trim().min(1).max(300),
      sido: z.string().trim().min(1).max(30),
      sigungu: z.string().trim().max(50),
    })
    .nullable()
    .refine((value) => value !== null, "카카오 주소검색에서 기본 주소를 선택해 주세요."),
  buildingDong: z.string().trim().max(40, "동은 40자 이내로 입력해 주세요."),
  unitHo: z.string().trim().max(40, "호수는 40자 이내로 입력해 주세요."),
  furniture: z.object({
    bed: furnitureStateSchema,
    desk: furnitureStateSchema,
    chair: furnitureStateSchema,
    wardrobe: furnitureStateSchema,
  }),
  bathroomCount: z
    .union([z.literal(1), z.literal(2)])
    .nullable()
    .refine((value) => value !== null, "화장실 개수를 선택해 주세요."),
});

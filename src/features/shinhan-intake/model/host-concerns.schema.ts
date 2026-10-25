import { z } from "zod";

export const hostConcernCodeSchema = z.enum([
  "YOUNG_PERSON",
  "LIFESTYLE",
  "PRIVACY",
  "RENT_MANAGEMENT",
  "PROCESS",
  "UNSURE",
]);

export type HostConcernCode = z.infer<typeof hostConcernCodeSchema>;

export const hostConcernResponseSchema = z.object({
  codes: z
    .array(hostConcernCodeSchema)
    .max(6, "걱정 항목은 최대 6개까지 선택할 수 있어요.")
    .transform((codes) => [...new Set(codes)]),
});

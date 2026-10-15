import { z } from "zod";

export const roomDistrictsResponseSchema = z.object({
  items: z.array(
    z.object({
      sido: z.string().trim().min(1),
      sigungu: z.string().trim().min(1),
      label: z.string().trim().min(1),
    }),
  ),
});

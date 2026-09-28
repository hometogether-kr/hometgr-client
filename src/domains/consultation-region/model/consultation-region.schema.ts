import { z } from "zod";

export const consultationRegionTypeSchema = z.enum(["university", "subway"]);
export const consultationRegionListSchema = z.object({
  items: z.array(
    z.object({
      id: z.uuid(),
      type: consultationRegionTypeSchema,
      name: z.string(),
      campusName: z.string().nullable(),
      displayName: z.string(),
      sido: z.string(),
      sigungu: z.string(),
    }),
  ),
});

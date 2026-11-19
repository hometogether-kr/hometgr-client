import { z } from "zod";

export const applicationPageQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(10000).default(1),
});
export const applicationListItemSchema = z.object({
  id: z.uuid(),
  universityCampus: z.string(),
  phone: z.string(),
  email: z.string(),
});
export const applicationListSchema = z.object({
  items: z.array(applicationListItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
});
export type ApplicationList = z.infer<typeof applicationListSchema>;

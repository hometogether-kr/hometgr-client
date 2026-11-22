import { z } from "zod";

import { moveInTimingSchema } from "@/domains/event-application";

export const applicationInputSchema = z.object({
  universityCampus: z.string().trim().min(1).max(120),
  moveInTiming: moveInTimingSchema,
  phone: z
    .string()
    .max(30)
    .transform((value) => value.replace(/[\s()-]/g, ""))
    .pipe(z.string().regex(/^\d{10,11}$/)),
  email: z.string().trim().min(1).max(254),
  consentAccepted: z.literal(true),
  source: z.string().trim().min(1).max(80).optional(),
});

export const submissionKeySchema = z.uuid();
export type ApplicationInput = z.infer<typeof applicationInputSchema>;

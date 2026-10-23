import { z } from "zod";

export const shinhanErrorEnvelopeSchema = z.object({
  error: z.object({
    code: z.string().min(1),
    message: z.string(),
    fieldErrors: z.record(z.string(), z.array(z.string())).optional(),
    retryable: z.boolean(),
  }),
  requestId: z.uuid().optional(),
});

export type ShinhanErrorDto = z.infer<typeof shinhanErrorEnvelopeSchema>;

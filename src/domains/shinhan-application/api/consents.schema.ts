import { z } from "zod";

import { shinhanConsentVersionSchema } from "./application.schema";

const consentSnapshotSchema = z.object({
  version: shinhanConsentVersionSchema,
  content: z.string().min(1),
  sha256: z.string().regex(/^[0-9a-f]{64}$/),
});

export const shinhanConsentsEnvelopeSchema = z.object({
  data: z.strictObject({
    required: consentSnapshotSchema,
    localOnly: z.boolean(),
  }),
});

export const shinhanConsentsResponseSchema = shinhanConsentsEnvelopeSchema.extend({
  csrfToken: z.string().min(1),
});

export type ShinhanConsentSnapshot = z.infer<typeof consentSnapshotSchema>;
export type ShinhanConsents = z.infer<typeof shinhanConsentsResponseSchema>["data"] & {
  csrfToken: string;
};

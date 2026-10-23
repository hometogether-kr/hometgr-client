import { z } from "zod";

import {
  type ShinhanApplication,
  shinhanApplicationIdSchema,
  shinhanApplicationResponseSchema,
  type ShinhanMutationCredentials,
  shinhanRequest,
  toShinhanApplication,
} from "@/domains/shinhan-application";

import {
  type ShinhanConcernsInput,
  shinhanConcernsInputSchema,
  type ShinhanCreateApplicationInput,
  shinhanCreateApplicationInputSchema,
} from "./application-input.schema";

export const shinhanSessionResponseSchema = z.object({
  data: z.object({ expiresAt: z.iso.datetime({ offset: true }) }),
});
export type ShinhanSession = z.infer<typeof shinhanSessionResponseSchema>["data"];

export async function createShinhanSession(csrfToken: string): Promise<ShinhanSession> {
  const response = await shinhanRequest({
    path: "/sessions",
    method: "POST",
    body: {},
    csrfToken,
    schema: shinhanSessionResponseSchema,
    expectedStatus: 201,
  });
  return response.data;
}

export interface CreateShinhanApplicationOptions extends ShinhanMutationCredentials {
  input: ShinhanCreateApplicationInput;
}

export async function createShinhanApplication({
  input,
  csrfToken,
  idempotencyKey,
}: CreateShinhanApplicationOptions): Promise<ShinhanApplication> {
  const body = shinhanCreateApplicationInputSchema.parse(input);
  const response = await shinhanRequest({
    path: "/applications",
    method: "POST",
    body,
    csrfToken,
    idempotencyKey,
    schema: shinhanApplicationResponseSchema,
    expectedStatus: 201,
  });
  return toShinhanApplication(response.data);
}

export interface SubmitShinhanConcernsOptions extends ShinhanMutationCredentials {
  applicationId: string;
  input: ShinhanConcernsInput;
}

export async function submitShinhanConcerns({
  applicationId,
  input,
  csrfToken,
  idempotencyKey,
}: SubmitShinhanConcernsOptions): Promise<ShinhanApplication> {
  const id = shinhanApplicationIdSchema.parse(applicationId);
  const body = shinhanConcernsInputSchema.parse(input);
  const response = await shinhanRequest({
    path: `/applications/${id}/concerns`,
    method: "PUT",
    body,
    csrfToken,
    idempotencyKey,
    schema: shinhanApplicationResponseSchema,
    expectedStatus: 200,
  });
  return toShinhanApplication(response.data);
}

export interface RequestShinhanIntroductionOptions extends ShinhanMutationCredentials {
  applicationId: string;
}

export async function requestShinhanIntroduction({
  applicationId,
  csrfToken,
  idempotencyKey,
}: RequestShinhanIntroductionOptions): Promise<ShinhanApplication> {
  const id = shinhanApplicationIdSchema.parse(applicationId);
  const response = await shinhanRequest({
    path: `/applications/${id}/introduction`,
    method: "POST",
    body: {},
    csrfToken,
    idempotencyKey,
    schema: shinhanApplicationResponseSchema,
    expectedStatus: 200,
  });
  return toShinhanApplication(response.data);
}

import { z } from "zod";

import {
  ShinhanApiError,
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

const sessionResetResponseSchema = z.strictObject({
  data: z.strictObject({ reset: z.literal(true) }),
});

export async function resetShinhanSession(csrfToken: string | null): Promise<void> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  // An expired session clears both cookies. Only this explicit reset may omit CSRF.
  if (csrfToken) headers["X-Shinhan-CSRF"] = z.string().min(1).parse(csrfToken);
  try {
    const response = await fetch("/api/shinhan/sessions/reset", {
      method: "POST",
      headers,
      body: "{}",
      credentials: "same-origin",
      cache: "no-store",
      redirect: "error",
    });
    const body: unknown = await response.json().catch(() => null);
    if (response.status !== 200 || !sessionResetResponseSchema.safeParse(body).success) {
      throw new ShinhanApiError(
        "새 신청 세션을 시작하지 못했습니다. 입력 내용은 유지됩니다. 다시 시도해 주세요.",
        {
          status: response.status,
          kind: "unknown",
          code: "SESSION_RESET_FAILED",
          retryable: false,
        },
      );
    }
  } catch (cause) {
    if (cause instanceof ShinhanApiError) throw cause;
    throw new ShinhanApiError(
      "연결을 확인하고 새 신청 세션 시작을 다시 시도해 주세요. 입력 내용은 유지됩니다.",
      {
        status: 0,
        kind: "network",
        code: "SESSION_RESET_FAILED",
        retryable: false,
      },
    );
  }
}

export async function createShinhanSession(csrfToken: string): Promise<ShinhanSession> {
  const response = await shinhanRequest({
    path: "/sessions",
    purpose: "sessionPreparation",
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

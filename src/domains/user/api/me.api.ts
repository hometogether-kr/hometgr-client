import { ApiError, apiRequest, toApiError } from "@/shared/api";

import { ANONYMOUS_SESSION, type Session } from "../model/current-user";
import type { MemberRole } from "../model/member-role";
import { toUserRole } from "../model/role-mapping";
import { meResponseDtoSchema } from "./user.dto";
import { toSession } from "./user.mapper";

const ONBOARDING_CONSENT_POLICY_VERSION = "1.0.0";

const REQUIRED_ONBOARDING_CONSENT_KEYS = {
  host: ["termsOfService", "privacyCollection", "privacyThirdParty", "locationBasedServiceTerms"],
  student: [
    "termsOfService",
    "privacyCollection",
    "privacyThirdParty",
    "alimtalkOptIn",
    "econtractAgreement",
    "paymentRefundPolicy",
  ],
} as const;

export interface CompleteOnboardingInput {
  role: MemberRole;
  name: string;
  email: string;
  phone: string;
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function createRequiredConsents(role: "student" | "host") {
  return {
    items: REQUIRED_ONBOARDING_CONSENT_KEYS[role].map((key) => ({
      key,
      agreed: true,
      policyVersion: ONBOARDING_CONSENT_POLICY_VERSION,
    })),
  };
}

/**
 * 현재 세션 조회
 *
 * 비로그인은 오류가 아니라 정상적인 상태이므로 401을 익명 세션으로 바꿔 돌려줍니다.
 * 그 외 오류는 화면이 구분해서 처리할 수 있도록 그대로 전달합니다.
 */
export async function fetchSession(signal?: AbortSignal): Promise<Session> {
  try {
    const dto = await apiRequest({
      path: "/me",
      schema: meResponseDtoSchema,
      signal,
    });

    return toSession(dto);
  } catch (error) {
    if (error instanceof ApiError && error.isUnauthorized) return ANONYMOUS_SESSION;
    throw error;
  }
}

/**
 * 온보딩을 완료합니다.
 *
 * `/me` 응답에는 새 토큰이 포함되므로 클라이언트가 API 서버를 직접 호출하지 않고
 * BFF 라우트에서 토큰을 httpOnly 쿠키로 갱신합니다.
 */
export async function completeOnboarding(input: CompleteOnboardingInput): Promise<Session> {
  const role = toUserRole(input.role);
  const response = await fetch("/api/auth/onboarding", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      role,
      name: input.name,
      email: input.email,
      phone: input.phone,
      consents: createRequiredConsents(role),
    }),
  });

  if (!response.ok) {
    throw toApiError(response.status, await readBody(response));
  }

  const parsed = meResponseDtoSchema.safeParse(await readBody(response));
  if (!parsed.success) {
    throw new ApiError("서버 응답 형식이 올바르지 않습니다.", {
      status: response.status,
      kind: "contract",
      cause: parsed.error,
    });
  }

  return toSession(parsed.data);
}

/** 세션 쿠키를 지웁니다. BFF 경로라 API 프록시를 거치지 않습니다. */
export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}

import { type MemberRole, type Session, toCurrentUser, toUserRole } from "@/domains/user";
import { ApiError, toApiError } from "@/shared/api";
import { ROUTES } from "@/shared/config";

import {
  switchMemberRoleRequestSchema,
  switchMemberRoleResponseSchema,
} from "../model/switch-member-role.schema";

export async function switchMemberRole(memberRole: MemberRole): Promise<Session> {
  const input = switchMemberRoleRequestSchema.parse({ role: toUserRole(memberRole) });
  let response: Response;
  try {
    response = await fetch(ROUTES.auth.role, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch (cause) {
    throw new ApiError("네트워크 연결을 확인해주세요.", { status: 0, kind: "network", cause });
  }

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) throw toApiError(response.status, body);

  const result = switchMemberRoleResponseSchema.safeParse(body);
  if (!result.success || result.data.user.role !== input.role) {
    throw new ApiError("역할 변경 응답을 확인하지 못했습니다.", {
      status: response.status,
      kind: "contract",
    });
  }

  return {
    isAuthenticated: true,
    onboardingRequired: result.data.onboardingRequired,
    user: toCurrentUser(result.data.user),
    // 역할별 동의 상태는 전환 후 /me에서 다시 조회합니다.
    consents: null,
  };
}

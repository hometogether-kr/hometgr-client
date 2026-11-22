import "server-only";

import { type NextRequest, NextResponse } from "next/server";

import { authOwnerResponseDtoSchema } from "@/domains/user";
import { httpErrorResponseDtoSchema } from "@/shared/api";
import {
  backendFetch,
  clearSessionTokensFromResponse,
  readSessionTokens,
  refreshTokenPair,
  type TokenPair,
  writeSessionTokensToResponse,
} from "@/shared/api/server";

import { switchMemberRoleRequestSchema } from "../model/switch-member-role.schema";

const RESPONSE_HEADERS = { "Cache-Control": "no-store", Pragma: "no-cache" };

function errorResponse(status: number, message: string): NextResponse {
  return NextResponse.json(
    { statusCode: status, message, path: "/me/role", timestamp: new Date().toISOString() },
    { status, headers: RESPONSE_HEADERS },
  );
}

export async function handleMemberRoleSwitch(request: NextRequest): Promise<NextResponse> {
  const input = switchMemberRoleRequestSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return errorResponse(400, "전환할 회원 유형을 확인해주세요.");

  const { accessToken, refreshToken } = await readSessionTokens();
  let renewedTokens: TokenPair | undefined;

  function withRefreshedSession(response: NextResponse): NextResponse {
    if (response.status === 401) clearSessionTokensFromResponse(response);
    else if (renewedTokens) writeSessionTokensToResponse(response, renewedTokens);
    return response;
  }

  function switchRole(token?: string): Promise<Response> {
    return backendFetch("/me/role", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input.data),
      accessToken: token,
    });
  }

  let response: Response;
  try {
    response = await switchRole(accessToken);
    if (response.status === 401 && refreshToken) {
      const renewed = await refreshTokenPair(refreshToken);
      if (!renewed) return withRefreshedSession(errorResponse(401, "로그인이 필요합니다."));
      renewedTokens = renewed;
      response = await switchRole(renewed.accessToken);
    }
  } catch {
    return withRefreshedSession(errorResponse(502, "API 서버에 연결하지 못했습니다."));
  }

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const error = httpErrorResponseDtoSchema.safeParse(body);
    return withRefreshedSession(
      error.success
        ? NextResponse.json(error.data, { status: response.status, headers: RESPONSE_HEADERS })
        : errorResponse(response.status, "회원 유형을 전환하지 못했습니다."),
    );
  }

  const result = authOwnerResponseDtoSchema.safeParse(body);
  if (!result.success || result.data.user.role !== input.data.role) {
    return withRefreshedSession(errorResponse(502, "역할 변경 응답을 확인하지 못했습니다."));
  }

  const { accessToken: nextAccessToken, refreshToken: nextRefreshToken, ...owner } = result.data;
  const nextResponse = NextResponse.json(owner, { headers: RESPONSE_HEADERS });
  writeSessionTokensToResponse(nextResponse, {
    accessToken: nextAccessToken,
    refreshToken: nextRefreshToken,
  });
  return nextResponse;
}

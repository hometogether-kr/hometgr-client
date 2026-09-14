import { NextResponse } from "next/server";

import {
  backendFetch,
  clearSessionTokens,
  readSessionTokens,
  refreshTokenPair,
} from "@/shared/api/server";

const STRIPPED_RESPONSE_HEADERS = new Set([
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "connection",
  "set-cookie",
]);

function toClientResponse(response: Response): NextResponse {
  const headers = new Headers();

  response.headers.forEach((value, name) => {
    if (!STRIPPED_RESPONSE_HEADERS.has(name.toLowerCase())) headers.set(name, value);
  });

  return new NextResponse(response.body, { status: response.status, headers });
}

function errorResponse(status: number, message: string, path: string): NextResponse {
  return NextResponse.json(
    { statusCode: status, message, path, timestamp: new Date().toISOString() },
    { status },
  );
}

async function deleteMe(accessToken?: string): Promise<Response> {
  return backendFetch("/me", { method: "DELETE", accessToken });
}

/**
 * 회원 탈퇴
 *
 * 백엔드 DELETE /me가 성공하면 모든 세션 쿠키를 삭제합니다. 409는 서버가 내려준
 * message를 화면에 그대로 보여줘야 하므로 응답 본문을 보존해서 전달합니다.
 */
export async function DELETE() {
  const { accessToken, refreshToken } = await readSessionTokens();

  let response: Response;
  try {
    response = await deleteMe(accessToken);
  } catch {
    return errorResponse(502, "API 서버에 연결하지 못했습니다.", "/me");
  }

  if (response.status === 401 && refreshToken) {
    const renewed = await refreshTokenPair(refreshToken);

    if (renewed) {
      try {
        response = await deleteMe(renewed.accessToken);
      } catch {
        return errorResponse(502, "API 서버에 연결하지 못했습니다.", "/me");
      }
    }
  }

  if (response.status === 204 || response.status === 401) {
    await clearSessionTokens();
  }

  return toClientResponse(response);
}

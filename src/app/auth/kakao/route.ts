import { NextResponse } from "next/server";

import { backendFetch, toCookieHeaderValue, writeOAuthStateCookie } from "@/shared/api/server";
import { ROUTES } from "@/shared/config";
import { getServerEnv } from "@/shared/config/env.server";

/**
 * 카카오 로그인 시작 (BFF)
 *
 * 브라우저는 API 서버의 `GET /auth/kakao`를 직접 열지 않고 이 경로로 이동합니다.
 * 여기서 서버끼리 통신해 카카오 인증 URL과 OAuth state 쿠키를 받아온 뒤,
 * state는 우리 도메인의 httpOnly 쿠키로 옮겨 담고 사용자만 카카오로 보냅니다.
 *
 * 이렇게 해야 콜백을 우리 origin에서 받아 토큰을 브라우저에 노출하지 않을 수 있습니다.
 */
export async function GET() {
  const { APP_BASE_URL } = getServerEnv();
  const loginUrl = new URL(ROUTES.auth.login, APP_BASE_URL);

  let response: Response;
  try {
    // redirect를 따라가면 카카오 화면 HTML을 서버가 받아버리므로 302에서 멈춥니다.
    response = await backendFetch("/auth/kakao", { redirect: "manual" });
  } catch {
    loginUrl.searchParams.set("error", "kakao_unavailable");
    return NextResponse.redirect(loginUrl);
  }

  const authorizeUrl = response.headers.get("location");
  if (!authorizeUrl) {
    loginUrl.searchParams.set("error", "kakao_unavailable");
    return NextResponse.redirect(loginUrl);
  }

  const stateCookie = toCookieHeaderValue(response.headers.getSetCookie());
  if (stateCookie) {
    await writeOAuthStateCookie(stateCookie);
  }

  return NextResponse.redirect(authorizeUrl);
}

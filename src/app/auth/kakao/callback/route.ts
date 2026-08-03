import { type NextRequest, NextResponse } from "next/server";

import { authOwnerResponseDtoSchema } from "@/domains/user";
import {
  backendFetch,
  clearOAuthStateCookie,
  readOAuthStateCookie,
  writeSessionTokens,
} from "@/shared/api/server";
import { ROUTES } from "@/shared/config";
import { getServerEnv } from "@/shared/config/env.server";

/**
 * 카카오 로그인 콜백 (BFF)
 *
 * 카카오는 이 경로로 사용자를 되돌려 보냅니다. 인가 코드를 API 서버와 교환하는 일은
 * 서버끼리 처리하고, 브라우저에는 토큰 대신 httpOnly 쿠키와 화면 이동만 남깁니다.
 *
 * 전제: API 서버에 등록된 카카오 redirect URI가 `{APP_BASE_URL}/auth/kakao/callback`
 * 이어야 합니다. 토큰 교환은 인증 시작에 사용한 redirect URI와 같은 값을 요구합니다.
 */
export async function GET(request: NextRequest) {
  const { APP_BASE_URL } = getServerEnv();
  const loginUrl = new URL(ROUTES.auth.login, APP_BASE_URL);
  const searchParams = request.nextUrl.searchParams;

  const failWith = async (reason: string) => {
    await clearOAuthStateCookie();
    loginUrl.searchParams.set("error", reason);
    return NextResponse.redirect(loginUrl);
  };

  // 사용자가 동의 화면에서 취소하면 code 대신 error가 옵니다.
  if (searchParams.get("error")) return failWith("kakao_cancelled");

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  if (!code || !state) return failWith("kakao_cancelled");

  const stateCookie = await readOAuthStateCookie();
  if (!stateCookie) return failWith("kakao_state_expired");

  let response: Response;
  try {
    response = await backendFetch(
      `/auth/kakao/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`,
      { headers: { cookie: stateCookie } },
    );
  } catch {
    return failWith("kakao_unavailable");
  }

  if (!response.ok) return failWith("kakao_failed");

  const parsed = authOwnerResponseDtoSchema.safeParse(await response.json().catch(() => null));
  if (!parsed.success) return failWith("kakao_failed");

  const { accessToken, refreshToken, onboardingRequired } = parsed.data;

  await writeSessionTokens({ accessToken, refreshToken });
  await clearOAuthStateCookie();

  const nextPath = onboardingRequired ? ROUTES.auth.terms : ROUTES.home;
  return NextResponse.redirect(new URL(nextPath, APP_BASE_URL));
}

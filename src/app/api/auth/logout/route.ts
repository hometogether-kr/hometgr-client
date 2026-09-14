import { NextResponse } from "next/server";

import {
  backendFetch,
  clearSessionTokens,
  readSessionTokens,
  refreshTokenPair,
} from "@/shared/api/server";

/**
 * 로그아웃
 *
 * 백엔드 세션을 먼저 무효화하고, 결과와 무관하게 httpOnly 쿠키를 지웁니다.
 * CSRF로 임의 로그아웃되는 것을 막기 위해 GET이 아닌 POST만 허용합니다.
 */
export async function POST() {
  const { accessToken, refreshToken } = await readSessionTokens();

  try {
    const response = await backendFetch("/auth/logout", {
      method: "POST",
      accessToken,
    });

    if (response.status === 401 && refreshToken) {
      const renewed = await refreshTokenPair(refreshToken);
      if (renewed) {
        await backendFetch("/auth/logout", {
          method: "POST",
          accessToken: renewed.accessToken,
        });
      }
    }
  } catch {
    /*
     * 네트워크·서버 오류가 나도 이 브라우저의 세션은 반드시 정리합니다.
     * 로그아웃 화면 흐름에서는 백엔드 실패보다 로컬 토큰 잔존이 더 위험합니다.
     */
  }

  await clearSessionTokens();
  return new NextResponse(null, { status: 204 });
}

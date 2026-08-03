import { NextResponse } from "next/server";

import { clearSessionTokens } from "@/shared/api/server";

/**
 * 로그아웃
 *
 * 세션은 httpOnly 쿠키에만 있으므로 쿠키를 지우는 것으로 끝납니다.
 * CSRF로 임의 로그아웃되는 것을 막기 위해 GET이 아닌 POST만 허용합니다.
 */
export async function POST() {
  await clearSessionTokens();
  return new NextResponse(null, { status: 204 });
}

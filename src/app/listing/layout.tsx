import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { hasSessionCookie } from "@/shared/api/server";
import { ROUTES } from "@/shared/config";

/**
 * 매물 등록 구간 로그인 가드
 *
 * 등록 화면은 전부 호스트 인증이 필요합니다. 폼을 다 채운 뒤 저장 단계에서야 401을
 * 만나면 입력이 날아가므로, 들어오는 시점에 서버에서 막습니다.
 *
 * 쿠키 존재만 확인하므로 만료된 토큰은 여기서 걸러지지 않습니다. 그 경우는 요청이
 * 401을 받는 시점에 QueryProvider가 로그인 화면으로 보냅니다.
 */
export default async function ListingLayout({ children }: { children: ReactNode }) {
  if (!(await hasSessionCookie())) {
    redirect(`${ROUTES.auth.login}?error=login_required`);
  }

  return children;
}

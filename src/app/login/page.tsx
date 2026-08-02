"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { LoginPage } from "@/pages-layer/login";
import { ROUTES } from "@/shared/config";
import { useToast } from "@/shared/ui/toast";

/** 카카오 인증에서 돌아왔을 때 실패 사유별 안내 문구 */
const LOGIN_ERROR_MESSAGE: Record<string, string> = {
  // Figma 643:19338
  kakao_cancelled: "카카오 로그인이 취소되었습니다.",
  kakao_state_expired: "로그인 유효 시간이 지났습니다. 다시 시도해주세요.",
  kakao_unavailable: "지금은 로그인할 수 없습니다. 잠시 후 다시 시도해주세요.",
  kakao_failed: "로그인에 실패했습니다. 다시 시도해주세요.",
  session_expired: "로그인이 필요합니다.",
  login_required: "매물 등록은 로그인 후 이용할 수 있어요.",
};

/** 카카오 인증에서 돌아왔을 때의 결과를 토스트로 알립니다. */
function KakaoResultToast() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const error = searchParams.get("error");

  useEffect(() => {
    if (!error) return;

    showToast(LOGIN_ERROR_MESSAGE[error] ?? LOGIN_ERROR_MESSAGE.kakao_failed, {
      variant: "error",
      duration: 0,
    });
  }, [error, showToast]);

  return null;
}

export default function Page() {
  const router = useRouter();

  /*
   * 카카오 인증은 외부 origin으로 나갔다 돌아오는 흐름이라 클라이언트 라우터 이동이
   * 아니라 브라우저 전체 이동이 필요합니다.
   */
  const handleKakaoLogin = () => {
    window.location.assign(ROUTES.auth.kakaoStart);
  };

  return (
    <>
      <Suspense fallback={null}>
        <KakaoResultToast />
      </Suspense>
      <LoginPage onKakaoLogin={handleKakaoLogin} onExplore={() => router.push(ROUTES.home)} />
    </>
  );
}

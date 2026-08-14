"use client";

import { useRouter } from "next/navigation";

import { ApiError } from "@/shared/api";
import { ROUTES } from "@/shared/config";
import { useToast } from "@/shared/ui/toast";

import { useAccountSessionActions } from "./use-account-session-actions";

export interface UseLogoutFlowResult {
  /** 로그아웃 → 세션 캐시 정리 → 로그인 화면 이동. 실패해도 reject하지 않고 토스트만 띄웁니다. */
  logout: () => Promise<void>;
  isLoggingOut: boolean;
}

/**
 * 로그아웃 실행 흐름
 *
 * 헤더와 마이페이지가 같은 동작을 해야 해서 한곳에 모읍니다. 이동 후 `router.refresh()`까지
 * 해야 서버 컴포넌트가 지워진 쿠키로 다시 그려져 비로그인 화면이 됩니다.
 */
export function useLogoutFlow(): UseLogoutFlowResult {
  const router = useRouter();
  const { logout, isLoggingOut } = useAccountSessionActions();
  const { showToast } = useToast();

  const runLogoutFlow = async () => {
    try {
      await logout();
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : "로그아웃하지 못했습니다.", {
        variant: "error",
      });
      return;
    }

    router.replace(ROUTES.auth.login);
    router.refresh();
  };

  return { logout: runLogoutFlow, isLoggingOut };
}

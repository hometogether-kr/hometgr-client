"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchSession } from "../api/me.api";
import { userQueryKeys } from "../api/user-query-keys";
import { ANONYMOUS_SESSION, type Session } from "./current-user";
import { useSessionHint } from "./session-hint";

export interface UseSessionResult {
  session: Session;
  /** 사용자 정보를 아직 받지 못한 상태 — 이름·이메일이 필요한 화면에서 확인하세요. */
  isLoading: boolean;
  /**
   * 로그인 여부. 조회가 끝나기 전에는 서버가 내려준 힌트를 사용하므로,
   * 로그인/비로그인 UI를 고르는 용도로는 로딩 중에도 바로 쓸 수 있습니다.
   */
  isAuthenticated: boolean;
  onboardingRequired: boolean;
}

/**
 * 현재 로그인 세션
 *
 * 세션은 여러 화면이 함께 보는 값이라 서버 상태 캐시에 한 번만 담아 공유합니다.
 */
export function useSession(): UseSessionResult {
  const hintedAuthenticated = useSessionHint();
  const { data, isLoading } = useQuery({
    queryKey: userQueryKeys.me(),
    queryFn: ({ signal }) => fetchSession(signal),
    staleTime: 60_000,
    /*
     * 세션 쿠키가 없으면 `/me`는 반드시 401이므로 아예 호출하지 않습니다.
     * 비로그인 방문자의 모든 페이지에서 불필요한 요청이 나가는 것을 막습니다.
     */
    enabled: hintedAuthenticated,
  });

  const session = data ?? ANONYMOUS_SESSION;

  return {
    session,
    isLoading,
    isAuthenticated: data ? data.isAuthenticated : hintedAuthenticated,
    onboardingRequired: session.onboardingRequired,
  };
}

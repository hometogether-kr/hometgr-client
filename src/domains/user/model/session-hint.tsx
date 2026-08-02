"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";

/**
 * 서버가 알려주는 로그인 여부 힌트
 *
 * 세션 확인은 클라이언트에서 `/me`를 받아야 끝나지만, 그때까지 헤더를 비워두면
 * 로그인 상태가 늦게 나타나 깜빡입니다. root layout이 세션 쿠키 유무를 미리
 * 읽어 내려주면 첫 HTML부터 맞는 쪽을 그릴 수 있습니다.
 *
 * 쿠키가 있어도 토큰이 만료됐을 수 있으므로 어디까지나 힌트이고, 조회가 끝나면
 * 실제 값으로 대체됩니다.
 */
const SessionHintContext = createContext(false);

export interface SessionHintProviderProps {
  /** 서버에서 읽은 세션 쿠키 존재 여부 */
  authenticated: boolean;
  children: ReactNode;
}

export function SessionHintProvider({ authenticated, children }: SessionHintProviderProps) {
  return <SessionHintContext value={authenticated}>{children}</SessionHintContext>;
}

export function useSessionHint(): boolean {
  return useContext(SessionHintContext);
}

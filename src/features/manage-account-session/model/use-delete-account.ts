"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { userQueryKeys } from "@/domains/user";
import { ApiError } from "@/shared/api";

import { deleteAccount } from "../api/account-session.api";

/**
 * 회원 탈퇴
 *
 * 성공 시 서버 쿠키는 Route Handler가 지우고, 클라이언트는 세션 캐시를 즉시 비워
 * 헤더와 마이페이지가 로그인 상태를 더 이상 붙잡지 않게 합니다. 이미 만료된 세션이라
 * 401이 와도 같은 정리를 해야 화면이 로그인 상태로 남지 않습니다.
 *
 * 로그아웃은 domains/user의 logout()을 그대로 씁니다 — 사이드바와 같은 경로입니다.
 */
export function useDeleteAccount() {
  const queryClient = useQueryClient();

  const clearSessionCache = () => {
    queryClient.removeQueries({ queryKey: userQueryKeys.me() });
  };

  const mutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: clearSessionCache,
    onError: (error) => {
      if (error instanceof ApiError && error.isUnauthorized) clearSessionCache();
    },
  });

  return {
    deleteAccount: mutation.mutateAsync,
    isDeletingAccount: mutation.isPending,
  };
}

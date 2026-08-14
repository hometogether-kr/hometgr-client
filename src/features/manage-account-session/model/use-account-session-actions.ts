"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { userQueryKeys } from "@/domains/user";
import { ApiError } from "@/shared/api";

import { deleteAccount, logoutAccount } from "../api/account-session.api";

/**
 * 계정 세션 액션
 *
 * 성공 시 서버 쿠키는 Route Handler가 삭제하고, 클라이언트는 세션 캐시를 즉시 비워
 * 헤더와 마이페이지가 로그인 상태를 더 이상 붙잡지 않게 합니다.
 */
export function useAccountSessionActions() {
  const queryClient = useQueryClient();

  const clearSessionCache = () => {
    queryClient.removeQueries({ queryKey: userQueryKeys.me() });
  };

  const logoutMutation = useMutation({
    mutationFn: logoutAccount,
    onSuccess: clearSessionCache,
  });

  const deleteAccountMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: clearSessionCache,
    onError: (error) => {
      if (error instanceof ApiError && error.isUnauthorized) clearSessionCache();
    },
  });

  return {
    logout: logoutMutation.mutateAsync,
    deleteAccount: deleteAccountMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
    isDeletingAccount: deleteAccountMutation.isPending,
  };
}

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { userQueryKeys } from "@/domains/user";

import {
  submitTermsConsents,
  type SubmitTermsConsentsInput,
} from "../api/terms-consents.api";

/**
 * 약관 동의 저장
 *
 * 성공하면 `/me` 캐시를 무효화해 이후 화면이 최신 온보딩/동의 상태를 다시 받습니다.
 * 이동·토스트 같은 화면 반응은 호출부에서 처리합니다.
 */
export function useSubmitTermsConsents() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (input: SubmitTermsConsentsInput) => submitTermsConsents(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userQueryKeys.me() });
    },
  });

  return {
    submitTermsConsents: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    submitError: mutation.error,
  };
}

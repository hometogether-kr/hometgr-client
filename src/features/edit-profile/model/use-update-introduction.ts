"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type Session, userQueryKeys } from "@/domains/user";

import { updateIntroduction } from "../api/update-introduction.api";

export function useUpdateIntroduction() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: updateIntroduction,
    onSuccess: (session: Session) => queryClient.setQueryData(userQueryKeys.me(), session),
  });

  return {
    updateIntroduction: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
}

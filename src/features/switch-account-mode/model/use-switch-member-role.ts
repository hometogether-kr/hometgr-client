"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { userQueryKeys } from "@/domains/user";

import { switchMemberRole } from "../api/switch-member-role.api";

export function useSwitchMemberRole() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: switchMemberRole,
    onSuccess: async (session) => {
      // 전환 전에 시작한 조회가 이전 역할로 세션을 덮어쓰지 않게 합니다.
      await queryClient.cancelQueries();
      queryClient.setQueryData(userQueryKeys.me(), session);
      await queryClient.invalidateQueries();
    },
  });

  return { switchMemberRole: mutation.mutateAsync, isSwitchingRole: mutation.isPending };
}

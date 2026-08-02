"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type ListingDraft, listingDraftQueryKeys } from "@/domains/listing-draft";
import { saveListingDraftStep } from "../api/draft-command.api";
import type { SaveStepCommand } from "./step-command.schema";

/**
 * 단계 저장
 *
 * 서버가 최신 초안을 응답으로 주므로 캐시를 그대로 교체합니다. 이렇게 해야 다음
 * 단계가 재조회 없이 최신 `version`으로 저장할 수 있습니다.
 *
 * 이동·토스트 같은 화면 반응은 이 훅의 계약이 아니라 호출부의 몫입니다.
 */
export function useSaveDraftStep(draftId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (command: SaveStepCommand) => saveListingDraftStep(draftId, command),
    onSuccess: (draft: ListingDraft) => {
      queryClient.setQueryData(listingDraftQueryKeys.detail(draftId), draft);
      // 목록의 진행 단계·저장 시각이 달라지므로 다음 조회 때 새로 받습니다.
      queryClient.invalidateQueries({ queryKey: listingDraftQueryKeys.lists() });
    },
  });

  return {
    saveStep: mutation.mutateAsync,
    isSaving: mutation.isPending,
    saveError: mutation.error,
  };
}

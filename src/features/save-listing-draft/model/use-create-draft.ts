"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type ListingDraft, listingDraftQueryKeys } from "@/domains/listing-draft";

import { createListingDraft } from "../api/draft-command.api";

/** 새 매물 등록 초안 생성 — 1단계로 들어가기 직전에 호출합니다. */
export function useCreateDraft() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createListingDraft,
    onSuccess: (draft: ListingDraft) => {
      queryClient.setQueryData(listingDraftQueryKeys.detail(draft.draftId), draft);
      void queryClient.invalidateQueries({ queryKey: listingDraftQueryKeys.lists() });
    },
  });

  return {
    createDraft: mutation.mutateAsync,
    isCreating: mutation.isPending,
    createError: mutation.error,
  };
}

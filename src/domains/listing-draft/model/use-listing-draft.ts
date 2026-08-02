"use client";

import { useQuery } from "@tanstack/react-query";
import { listingDraftQueryKeys } from "../api/draft-query-keys";
import { fetchListingDraft, fetchListingDrafts } from "../api/draft.api";

/** 이어쓸 초안 목록 — 시작 화면에서 사용합니다. */
export function useListingDrafts() {
  const { data, isPending, error } = useQuery({
    queryKey: listingDraftQueryKeys.lists(),
    queryFn: ({ signal }) => fetchListingDrafts(signal),
  });

  return { drafts: data ?? [], isLoading: isPending, error };
}

/**
 * 초안 상세
 *
 * 단계 저장 요청에 필요한 `version`이 여기 담기므로, 각 단계 화면은 이 값을 읽어
 * 그대로 되돌려 보냅니다. 서버가 최신 version을 응답으로 주기 때문에 캐시를
 * 갱신하면 다음 단계가 자동으로 최신 값을 씁니다.
 */
export function useListingDraft(draftId: string | null) {
  const { data, isPending, error } = useQuery({
    queryKey: listingDraftQueryKeys.detail(draftId ?? ""),
    queryFn: ({ signal }) => fetchListingDraft(draftId as string, signal),
    enabled: draftId !== null,
  });

  return { draft: data ?? null, isLoading: draftId !== null && isPending, error };
}

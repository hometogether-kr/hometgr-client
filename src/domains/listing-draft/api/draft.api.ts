import { apiRequest } from "@/shared/api";
import type { ListingDraft, ListingDraftSummary } from "../model/draft";
import { draftDetailSchema, draftListSchema } from "./draft.dto";
import { toListingDraft, toListingDraftSummary } from "./draft.mapper";

const DRAFTS_PATH = "/host/rooms/drafts";

/** 내 매물 등록 초안 목록 — 최근 저장 순으로 정렬해 돌려줍니다. */
export async function fetchListingDrafts(signal?: AbortSignal): Promise<ListingDraftSummary[]> {
  const dtos = await apiRequest({
    path: DRAFTS_PATH,
    schema: draftListSchema,
    signal,
  });

  return dtos
    .map(toListingDraftSummary)
    .sort((a, b) => b.lastSavedAt.getTime() - a.lastSavedAt.getTime());
}

export async function fetchListingDraft(
  draftId: string,
  signal?: AbortSignal,
): Promise<ListingDraft> {
  const dto = await apiRequest({
    path: `${DRAFTS_PATH}/${draftId}`,
    schema: draftDetailSchema,
    signal,
  });

  return toListingDraft(dto);
}

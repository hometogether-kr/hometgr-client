"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  type DraftMediaMutationDto,
  type ListingDraft,
  listingDraftQueryKeys,
  toDraftPhoto,
} from "@/domains/listing-draft";
import {
  type DeleteDraftPhotoInput,
  deleteDraftPhoto,
  uploadDraftPhotos,
} from "../api/draft-command.api";

/**
 * 사진 변경 응답은 초안 전체가 아니라 version·미디어 목록만 담고 있어,
 * 기존 캐시에 덮어쓰는 방식으로 갱신합니다.
 */
function mergePhotoMutation(
  draft: ListingDraft | undefined,
  result: DraftMediaMutationDto,
): ListingDraft | undefined {
  if (!draft) return draft;

  return {
    ...draft,
    version: result.version,
    lastSavedAt: new Date(result.lastSavedAt),
    photos: [...result.media]
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map(toDraftPhoto),
  };
}

export function useDraftPhotos(draftId: string) {
  const queryClient = useQueryClient();
  const detailKey = listingDraftQueryKeys.detail(draftId);

  const applyResult = (result: DraftMediaMutationDto) => {
    queryClient.setQueryData<ListingDraft>(detailKey, (draft) =>
      mergePhotoMutation(draft, result),
    );
    queryClient.invalidateQueries({ queryKey: listingDraftQueryKeys.lists() });
  };

  const upload = useMutation({
    mutationFn: (input: { expectedVersion: number; files: readonly File[] }) =>
      uploadDraftPhotos({ draftId, ...input }),
    onSuccess: applyResult,
  });

  const remove = useMutation({
    mutationFn: (input: Omit<DeleteDraftPhotoInput, "draftId">) =>
      deleteDraftPhoto({ draftId, ...input }),
    onSuccess: applyResult,
  });

  return {
    uploadPhotos: upload.mutateAsync,
    isUploading: upload.isPending,
    uploadError: upload.error,
    deletePhoto: remove.mutateAsync,
    isDeleting: remove.isPending,
    deleteError: remove.error,
  };
}

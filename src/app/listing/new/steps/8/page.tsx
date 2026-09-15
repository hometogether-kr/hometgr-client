"use client";

import { Suspense, useMemo, useRef } from "react";

import { useDraftPhotos, useDraftStepFlow } from "@/features/save-listing-draft";
import { ListingStep8Page } from "@/pages-layer/listing-step-8-photos";
import { ApiError } from "@/shared/api";
import { useToast } from "@/shared/ui/toast";

function Step8() {
  const { draftId, draft, isLoading, isSaving, saveAndGoNext, goPrev } = useDraftStepFlow(9);
  const { uploadPhotos, isUploading, deletePhoto, isDeleting } = useDraftPhotos(draftId ?? "");
  const actionPending = useRef(false);
  const { showToast } = useToast();

  const photos = useMemo(
    () => (draft?.photos ?? []).map((photo) => ({ id: photo.id, url: photo.readUrl })),
    [draft?.photos],
  );

  /*
   * 사진은 다음 단계로 넘어갈 때가 아니라 고르는 즉시 업로드합니다.
   * 9단계 저장은 업로드된 미디어 ID만 참조하기 때문입니다.
   */
  const handleAddFiles = async (files: File[]) => {
    if (!draft || actionPending.current) return;
    actionPending.current = true;

    try {
      await uploadPhotos({ expectedVersion: draft.version, files });
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : "사진을 올리지 못했습니다.", {
        variant: "error",
      });
    } finally {
      actionPending.current = false;
    }
  };

  const handleDeletePhoto = async (mediaId: string) => {
    if (!draft || actionPending.current) return;
    actionPending.current = true;
    try {
      await deletePhoto({ mediaId, expectedVersion: draft.version });
      showToast("사진을 삭제했습니다.", { variant: "success" });
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : "사진을 삭제하지 못했습니다.", {
        variant: "error",
      });
    } finally {
      actionPending.current = false;
    }
  };

  const handleNext = async (orderedPhotoIds: string[]) => {
    if (!draft || actionPending.current) return;
    actionPending.current = true;
    try {
      await saveAndGoNext({
        mediaIds: orderedPhotoIds,
        representativeMediaId: orderedPhotoIds[0],
      });
    } finally {
      actionPending.current = false;
    }
  };

  return (
    <ListingStep8Page
      photos={photos}
      isUploading={isUploading}
      isSaving={isSaving}
      isDeleting={isDeleting}
      isLoading={isLoading || !draft}
      onDeletePhoto={(mediaId) => void handleDeletePhoto(mediaId)}
      onAddFiles={(files) => void handleAddFiles(files)}
      onPrev={goPrev}
      onNext={(values) => void handleNext(values)}
    />
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Step8 />
    </Suspense>
  );
}

"use client";

import { Suspense } from "react";

import { useDraftPhotos, useDraftStepFlow } from "@/features/save-listing-draft";
import { ListingStep8Page } from "@/pages-layer/listing-step-8-photos";
import { ApiError } from "@/shared/api";
import { useToast } from "@/shared/ui/toast";

function Step8() {
  const { draftId, draft, isSaving, saveAndGoNext, goPrev } = useDraftStepFlow(9);
  const { uploadPhotos, isUploading } = useDraftPhotos(draftId ?? "");
  const { showToast } = useToast();

  const photos = (draft?.photos ?? []).map((photo) => ({ id: photo.id, url: photo.readUrl }));

  /*
   * 사진은 다음 단계로 넘어갈 때가 아니라 고르는 즉시 업로드합니다.
   * 9단계 저장은 업로드된 미디어 ID만 참조하기 때문입니다.
   */
  const handleAddFiles = async (files: File[]) => {
    if (!draft) return;

    try {
      await uploadPhotos({ expectedVersion: draft.version, files });
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : "사진을 올리지 못했습니다.", {
        variant: "error",
      });
    }
  };

  const handleNext = (orderedPhotoIds: string[]) =>
    saveAndGoNext({
      mediaIds: orderedPhotoIds,
      // 화면에서 맨 앞에 둔 사진이 대표 사진입니다.
      representativeMediaId: orderedPhotoIds[0],
    });

  return (
    <ListingStep8Page
      /* 사진이 추가·삭제되면 순서 편집 상태를 서버 순서로 되돌립니다. */
      key={photos.map((photo) => photo.id).join(",")}
      photos={photos}
      isUploading={isUploading}
      isSaving={isSaving}
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

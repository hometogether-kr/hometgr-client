"use client";

import { useMemo, useRef, useState } from "react";

import { MAX_LISTING_PHOTOS, MIN_LISTING_PHOTOS } from "@/features/save-listing-draft";
import { BtnCta } from "@/shared/ui/btn-cta";
import { InfoBox } from "@/shared/ui/info-box";
import { useToast } from "@/shared/ui/toast";
import { ListingStepLayout } from "@/widgets/listing-step-layout";

/**
 * TODO: 사진 업로드 플레이스홀더 아이콘은 7일 후 만료되는 Figma 임시 URL입니다.
 * export해 public/icons 또는 public/figma에 커밋한 뒤 교체하세요.
 */
const FIGMA_TEMP_IC_PHOTO = "/figma/ic-photo-7ac1ef58.svg";

const GUIDE_LINES = [
  "방 전체가 잘 보이는 사진을 먼저 올려주세요.",
  "사진은 6장부터 20장까지 등록할 수 있어요.",
  "첫 번째 사진은 대표사진으로 보여요.",
  "마우스로 사진 클릭후 드래그하여 순서를 바꿀 수 있어요.",
  "추천 사진: 창문 혹은 채광이 보이는 사진, 욕실 사진, 사용 가능한 공용 공간 사진(주방, 세탁실 등), 출입 동선",
];

const MIN_PHOTOS = MIN_LISTING_PHOTOS;
const MAX_PHOTOS = MAX_LISTING_PHOTOS;
const MIN_PHOTOS_MESSAGE = `최소 ${MIN_PHOTOS}장의 사진을 필수로 등록해야합니다.`;

/** 서버에 저장된 초안 사진 */
export interface ListingStep8Photo {
  id: string;
  url: string;
}

export interface ListingStep8PageProps {
  /** 표시 순서대로 정렬된 저장 완료 사진 */
  photos?: readonly ListingStep8Photo[];
  onAddFiles?: (files: File[]) => void;
  onPrev?: () => void;
  /** 정렬된 사진 ID — 첫 번째가 대표 사진입니다. */
  onNext?: (orderedPhotoIds: string[]) => void;
  isUploading?: boolean;
  isSaving?: boolean;
}

function orderSavedPhotos(
  orderedPhotoIds: readonly string[],
  savedPhotos: readonly ListingStep8Photo[],
): readonly ListingStep8Photo[] {
  const savedById = new Map(savedPhotos.map((photo) => [photo.id, photo]));
  const ordered = orderedPhotoIds
    .map((photoId) => savedById.get(photoId))
    .filter((photo): photo is ListingStep8Photo => photo !== undefined);
  const orderedIds = new Set(ordered.map((photo) => photo.id));
  const added = savedPhotos.filter((photo) => !orderedIds.has(photo.id));

  return [...ordered, ...added];
}

/**
 * 8단계 · 사진 업로드 (Figma: node 420:7100 · 420:7141)
 *
 * - 사진 없음: 점선 드롭존
 * - 사진 있음: 180px 카드 그리드(첫 장에 "대표 사진" 배지) + 추가 버튼
 * - 드래그로 순서 변경
 */
export function ListingStep8Page({
  photos: savedPhotos = [],
  onAddFiles,
  onPrev,
  onNext,
  isUploading = false,
  isSaving = false,
}: ListingStep8PageProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [orderedPhotoIds, setOrderedPhotoIds] = useState<readonly string[]>(() =>
    savedPhotos.map((photo) => photo.id),
  );
  const [submitted, setSubmitted] = useState(false);
  const dragIndex = useRef<number | null>(null);
  const { showToast } = useToast();
  const photos = useMemo(
    () => orderSavedPhotos(orderedPhotoIds, savedPhotos),
    [orderedPhotoIds, savedPhotos],
  );

  const hasError = photos.length < MIN_PHOTOS;

  const handleNext = () => {
    setSubmitted(true);
    if (hasError) {
      showToast(MIN_PHOTOS_MESSAGE, { variant: "error" });
      return;
    }
    onNext?.(photos.map((photo) => photo.id));
  };

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    const files = Array.from(fileList).slice(0, MAX_PHOTOS - photos.length);
    if (files.length > 0) onAddFiles?.(files);
  };

  const reorder = (from: number, to: number) => {
    setOrderedPhotoIds(() => {
      const next = photos.map((photo) => photo.id);
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  return (
    <ListingStepLayout
      step={8}
      title="사용할 공간의 사진과 영상을 업로드해주세요"
      description="방의 분위기가 잘 보이는 사진일수록 입주자가 더 안심하고 선택할 수 있어요."
      onPrev={onPrev}
      onNext={handleNext}
      nextDisabled={isUploading || isSaving}
      autoSaving={isUploading || isSaving}
    >
      {submitted && hasError && (
        <p className="w-full pb-1 text-[13px] leading-[1.4] font-medium text-system-error">
          {MIN_PHOTOS_MESSAGE}
        </p>
      )}
      <div className="flex w-full flex-col items-center gap-2">
        {photos.length === 0 ? (
          <div className="flex min-h-[257px] w-full items-center justify-center rounded-[10px] border border-dashed border-grayscale-400 px-4 py-[120px]">
            <div className="flex w-[92px] flex-col items-center gap-5">
              <span className="block size-10" aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element -- 임시 Figma 에셋, 커밋된 SVG로 교체 예정 */}
                <img alt="" src={FIGMA_TEMP_IC_PHOTO} className="block size-full max-w-none" />
              </span>
              <BtnCta
                variant="stroke"
                size="xs"
                className="w-full"
                disabled={isUploading}
                onClick={() => inputRef.current?.click()}
              >
                사진 업로드
              </BtnCta>
            </div>
          </div>
        ) : (
          <ul className="grid w-full grid-cols-2 gap-3 md:flex md:flex-wrap md:gap-4">
            {photos.map((photo, index) => (
              <li
                key={photo.id}
                draggable
                onDragStart={() => {
                  dragIndex.current = index;
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragIndex.current !== null) reorder(dragIndex.current, index);
                  dragIndex.current = null;
                }}
                className="relative aspect-square w-full cursor-grab overflow-hidden rounded-[10px] md:size-[180px]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- 사용자가 업로드한 로컬 파일 미리보기 */}
                <img
                  alt={`매물 사진 ${index + 1}`}
                  src={photo.url}
                  className="size-full object-cover"
                />
                {index === 0 && (
                  <span className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-primary-500 py-2 text-base leading-[1.5] font-bold text-white">
                    대표 사진
                  </span>
                )}
              </li>
            ))}
            {photos.length < MAX_PHOTOS && (
              <li className="flex aspect-square w-full items-center justify-center rounded-[10px] border border-dashed border-grayscale-400 md:size-[180px]">
                <BtnCta variant="stroke" size="xs" onClick={() => inputRef.current?.click()}>
                  사진 추가
                </BtnCta>
              </li>
            )}
          </ul>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="sr-only"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <InfoBox title="안내" className="w-full">
          <ul className="flex flex-col">
            {GUIDE_LINES.map((line) => (
              <li key={line}>· {line}</li>
            ))}
          </ul>
        </InfoBox>
      </div>
    </ListingStepLayout>
  );
}

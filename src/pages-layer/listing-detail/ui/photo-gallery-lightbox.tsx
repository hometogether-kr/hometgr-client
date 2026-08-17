"use client";

import type { RoomPhoto } from "@/domains/listing";
import { cn } from "@/shared/lib/cn";
import { Modal } from "@/shared/ui/modal";

/** 헤더 드롭다운에 쓰는 화살표를 좌/우로 회전해 재사용합니다. */
const IC_ARROW = "/figma/ic-arrow-down-2f96af07.svg";
const IC_CLOSE = "/icons/ic-x-cancel.svg";

export interface PhotoGalleryLightboxProps {
  open: boolean;
  photos: RoomPhoto[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

/* eslint-disable @next/next/no-img-element -- 원본 매물 사진, next/image 최적화 대상 아님 */

/**
 * 사진 갤러리 라이트박스 (Figma: node 1222:47966)
 *
 * 큰 이미지 + 이전/다음 화살표 + 하단 썸네일 스트립. 현재 보고 있는 사진 인덱스는
 * 부모(회원 갤러리)가 소유하며, 이 컴포넌트는 그대로 반영만 합니다. 회원만
 * 매물 사진 전체를 열람할 수 있어 회원 갤러리에서만 엽니다.
 */
export function PhotoGalleryLightbox({
  open,
  photos,
  index,
  onIndexChange,
  onClose,
}: PhotoGalleryLightboxProps) {
  if (photos.length === 0) return null;

  const goPrev = () => onIndexChange(index === 0 ? photos.length - 1 : index - 1);
  const goNext = () => onIndexChange(index === photos.length - 1 ? 0 : index + 1);

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeButton="none"
      classNames={{ dialog: "w-full max-w-[1040px] md:w-full", panel: "gap-5 p-5 md:p-9" }}
    >
      <div className="flex items-center justify-between">
        <p className="text-headline-1 font-medium text-grayscale-700">
          {index + 1}/{photos.length}
        </p>
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="flex items-center p-1 transition-opacity hover:opacity-70"
        >
          <img alt="" src={IC_CLOSE} className="block size-5 max-w-none" />
        </button>
      </div>

      <div className="relative w-full">
        <div className="aspect-16/10 w-full overflow-hidden rounded-xl bg-grayscale-100">
          <img
            alt={photos[index].alt}
            src={photos[index].url}
            className="block size-full object-cover"
          />
        </div>

        {photos.length > 1 && (
          <>
            <button
              type="button"
              aria-label="이전 사진"
              onClick={goPrev}
              className="absolute top-1/2 left-3 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 transition-opacity hover:opacity-80"
            >
              <img alt="" src={IC_ARROW} className="block size-3.5 max-w-none rotate-90" />
            </button>
            <button
              type="button"
              aria-label="다음 사진"
              onClick={goNext}
              className="absolute top-1/2 right-3 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 transition-opacity hover:opacity-80"
            >
              <img alt="" src={IC_ARROW} className="block size-3.5 max-w-none -rotate-90" />
            </button>
          </>
        )}
      </div>

      {photos.length > 1 && (
        <div className="flex w-full gap-3 overflow-x-auto">
          {photos.map((photo, photoIndex) => (
            <button
              key={photo.id}
              type="button"
              aria-label={`${photoIndex + 1}번째 사진 보기`}
              aria-current={photoIndex === index}
              onClick={() => onIndexChange(photoIndex)}
              className={cn(
                "aspect-4/3 h-20 shrink-0 overflow-hidden rounded-lg border-2 transition-opacity",
                photoIndex === index
                  ? "border-primary-500"
                  : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              <img alt="" src={photo.url} className="block size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}

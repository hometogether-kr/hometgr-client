"use client";

import { useState } from "react";

import type { RoomPhoto } from "@/domains/listing";
import { cn } from "@/shared/lib/cn";

import { PhotoGalleryLightbox } from "./photo-gallery-lightbox";

export interface PhotoGalleryMemberProps {
  photos: RoomPhoto[];
}

/* eslint-disable @next/next/no-img-element -- 원본 매물 사진, next/image 최적화 대상 아님 */

/**
 * 사진 갤러리 — 회원 (Figma: node 1222:45294)
 *
 * 대표 사진 1장 + 그리드 3장을 그대로 보여주고, 마지막 칸은 흐림 처리한 채
 * 남은 사진 수를 배지로 안내합니다. 아무 칸이나 누르면 라이트박스가 그
 * 사진부터 열립니다.
 */
export function PhotoGalleryMember({ photos }: PhotoGalleryMemberProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [main, ...rest] = photos;
  const grid = rest.slice(0, 4);
  const hiddenCount = photos.length - grid.length - 1;

  if (!main) {
    return (
      <div className="flex h-[280px] w-full items-center justify-center rounded-2xl bg-grayscale-70 text-headline-1 font-medium text-grayscale-400 md:h-[420px] md:rounded-3xl">
        등록된 사진이 없어요
      </div>
    );
  }

  return (
    <>
      <div className="relative flex h-[280px] w-full gap-3 md:h-[420px]">
        <button
          type="button"
          onClick={() => setLightboxIndex(0)}
          className="h-full flex-1 overflow-hidden rounded-l-2xl md:rounded-l-3xl"
        >
          <img alt={main.alt} src={main.url} className="block size-full object-cover" />
        </button>
        <div className="hidden h-full w-[600px] shrink-0 grid-cols-2 grid-rows-2 gap-3 md:grid">
          {grid.map((photo, index) => {
            const isLast = index === grid.length - 1;
            const photoIndex = index + 1;

            return (
              <button
                key={photo.id}
                type="button"
                onClick={() => setLightboxIndex(photoIndex)}
                className={cn(
                  "relative overflow-hidden",
                  index === 1 && "rounded-tr-3xl",
                  index === 3 && "rounded-br-3xl",
                )}
              >
                <img
                  alt={photo.alt}
                  src={photo.url}
                  className={cn(
                    "block size-full object-cover",
                    isLast && hiddenCount > 0 && "blur-sm",
                  )}
                />
                {isLast && hiddenCount > 0 && (
                  <span className="absolute inset-0 flex items-center justify-center bg-grayscale-900/50">
                    <span className="rounded-full bg-white/20 px-5 py-2.5 text-headline-1 text-white">
                      제공 사진 <span className="font-semibold">{photos.length}장</span>
                    </span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <PhotoGalleryLightbox
        open={lightboxIndex !== null}
        photos={photos}
        index={lightboxIndex ?? 0}
        onIndexChange={setLightboxIndex}
        onClose={() => setLightboxIndex(null)}
      />
    </>
  );
}

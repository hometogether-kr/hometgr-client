"use client";

import Image from "next/image";
import { type KeyboardEvent, useRef, useState } from "react";

import styles from "./education-gallery.module.css";

export interface EducationPhoto {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
}

export function EducationGallery({ photos }: { photos: EducationPhoto[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activePhoto = activeIndex === null ? undefined : photos[activeIndex];

  function openPhoto(index: number, button: HTMLButtonElement) {
    triggerRef.current = button;
    setActiveIndex(index);
    dialogRef.current?.showModal();
  }

  function movePhoto(direction: number) {
    setActiveIndex((index) => ((index ?? 0) + direction + photos.length) % photos.length);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (photos.length < 2 || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
    event.preventDefault();
    movePhoto(event.key === "ArrowLeft" ? -1 : 1);
  }

  function handleClose() {
    setActiveIndex(null);
    triggerRef.current?.focus({ preventScroll: true });
  }

  if (photos.length === 0) return null;

  return (
    <>
      <ul className={styles.grid}>
        {photos.map((photo, index) => (
          <li key={photo.src}>
            <figure>
              <button
                type="button"
                className={styles.thumbnail}
                onClick={(event) => openPhoto(index, event.currentTarget)}
                aria-label={`${photo.caption} 사진 크게 보기`}
                aria-haspopup="dialog"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  sizes="(max-width: 519px) 94vw, (max-width: 799px) 50vw, (max-width: 1080px) 33vw, 332px"
                />
              </button>
              <figcaption className={styles.caption}>{photo.caption}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-label="교육 현장 사진 크게 보기"
        onKeyDown={handleKeyDown}
        onClose={handleClose}
      >
        <div className={styles.viewer}>
          <div className={styles.viewerHeader}>
            <span className={styles.counter} aria-live="polite">
              {activeIndex !== null && `${activeIndex + 1} / ${photos.length}`}
            </span>
            <button
              type="button"
              className={styles.close}
              onClick={() => dialogRef.current?.close()}
            >
              닫기
            </button>
          </div>
          <div className={styles.stage}>
            {activePhoto && (
              <Image
                src={activePhoto.src}
                alt={activePhoto.alt}
                width={activePhoto.width}
                height={activePhoto.height}
                loading="eager"
                unoptimized
              />
            )}
          </div>
          <div className={styles.footer}>
            <p aria-live="polite" aria-atomic="true">
              {activePhoto?.caption}
            </p>
            {photos.length > 1 && (
              <div className={styles.navigation}>
                <button type="button" onClick={() => movePhoto(-1)} aria-label="이전 사진">
                  이전
                </button>
                <button type="button" onClick={() => movePhoto(1)} aria-label="다음 사진">
                  다음
                </button>
              </div>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}

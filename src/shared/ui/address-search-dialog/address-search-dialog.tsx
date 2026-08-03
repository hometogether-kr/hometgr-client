"use client";

import { useEffect, useRef, useState } from "react";

import {
  loadKakaoPostcode,
  type SelectedAddress,
  toSelectedAddress,
} from "@/shared/lib/kakao-postcode";

export interface AddressSearchDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (address: SelectedAddress) => void;
}

/** 문서 권장 최소 높이(400)보다 여유를 둔 값 */
const EMBED_HEIGHT = 460;

/**
 * 주소 검색 레이어
 *
 * 팝업(window.open)은 일부 웹뷰에서 열리지 않아, 문서가 권장하는 레이어 모드로
 * iframe을 끼워 넣습니다. 하단 로고와 스크립트는 손대지 않습니다.
 */
export function AddressSearchDialog({ open, onClose, onSelect }: AddressSearchDialogProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  /*
   * 외부 스크립트가 만드는 iframe을 우리 DOM에 붙였다 떼는 작업이라 effect로
   * 동기화합니다. 닫힐 때 컨테이너를 비워 다음에 열 때 중복 삽입되지 않게 합니다.
   */
  useEffect(() => {
    if (!open) return;

    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    setError(null);

    loadKakaoPostcode()
      .then((Postcode) => {
        if (cancelled) return;

        new Postcode({
          // 서버는 "서울특별시 마포구" 형태를 쓰므로 축약 표기를 끕니다.
          shorthand: false,
          width: "100%",
          height: "100%",
          oncomplete: (result) => {
            onSelect(toSelectedAddress(result));
            onClose();
          },
        }).embed(container);
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setError(cause instanceof Error ? cause.message : "우편번호 서비스를 불러오지 못했습니다.");
      });

    return () => {
      cancelled = true;
      container.replaceChildren();
    };
  }, [open, onClose, onSelect]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
      <button
        type="button"
        aria-label="주소 검색 닫기"
        className="absolute inset-0 size-full bg-black/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="주소 검색"
        className="relative flex w-full max-w-[500px] flex-col overflow-hidden rounded-2xl bg-white shadow-lg"
      >
        <div className="flex items-center justify-between border-b border-grayscale-200 px-5 py-4">
          <h2 className="text-base leading-[1.4] font-semibold text-grayscale-900">주소 검색</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-medium text-grayscale-600 hover:text-grayscale-900"
          >
            닫기
          </button>
        </div>
        {error ? (
          <p className="px-5 py-10 text-center text-sm font-medium text-system-error">{error}</p>
        ) : (
          <div ref={containerRef} style={{ height: EMBED_HEIGHT }} className="w-full" />
        )}
      </div>
    </div>
  );
}

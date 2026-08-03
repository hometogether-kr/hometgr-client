"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** 헤더 제목. 생략하면 헤더 영역이 렌더링되지 않습니다. */
  title?: string;
  children: ReactNode;
  /** 본문 아래 액션 영역 */
  footer?: ReactNode;
  className?: string;
}

/**
 * TODO: 7일 후 만료되는 Figma 임시 URL입니다. ic_x_cancel을 SVG로 export해
 * shared/ui/icons에 커밋한 뒤 교체하세요.
 */
const FIGMA_TEMP_CLOSE = "https://www.figma.com/api/mcp/asset/1cdf01dc-8eee-4aae-b616-aac2a71825f5";

/**
 * 공통 모달 (Figma: 방문 예약 신청, node 1299:38833)
 *
 * - 데스크톱: 화면 중앙 카드 (rounded-16 · px-40 py-36)
 * - 모바일: 좌우 20px 여백 안에서 전체 폭
 *
 * 열려 있는 동안 body 스크롤을 잠그고, ESC와 배경 클릭으로 닫습니다.
 * 포커스는 열릴 때 모달 안으로 옮기고 Tab을 모달 내부로 가둡니다.
 */
export function Modal({ open, onClose, title, children, footer, className }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const focusables = () =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );

    focusables()[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const items = focusables();
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-grayscale-900/40 px-5 py-10"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        onClick={(event) => event.stopPropagation()}
        className={cn(
          "flex max-h-full w-full flex-col gap-6 overflow-y-auto rounded-2xl bg-white p-5 md:w-[572px] md:px-10 md:py-9",
          className,
        )}
      >
        {title && (
          <div className="flex items-center justify-between">
            <h2 id={titleId} className="text-heading-1 font-medium text-grayscale-900">
              {title}
            </h2>
            <button
              type="button"
              aria-label="닫기"
              onClick={onClose}
              className="flex items-center p-3 transition-opacity hover:opacity-70"
            >
              <span className="flex size-5 items-center justify-center overflow-clip rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element -- 임시 Figma 에셋, 커밋된 SVG로 교체 예정 */}
                <img alt="" src={FIGMA_TEMP_CLOSE} className="block size-[14px] max-w-none" />
              </span>
            </button>
          </div>
        )}

        <div className="flex flex-col gap-3">{children}</div>

        {footer}
      </div>
    </div>,
    document.body,
  );
}

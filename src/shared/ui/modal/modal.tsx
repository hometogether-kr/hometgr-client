"use client";

import type { ReactNode } from "react";
import { useId, useRef } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/shared/lib/cn";
import { useDialogBehavior } from "@/shared/lib/hooks";
import { Icon } from "@/shared/ui/icons";

/**
 * 닫기 버튼 위치
 *
 * - header: 제목 오른쪽 (Figma 방문 예약 신청 1299:38833)
 * - outside: 카드 바깥 위쪽 (Figma 은행 선택 703:23860 · 643:19924)
 * - none: 모달이 직접 닫기 UI를 그립니다 (Figma 약관 전문 646:28184의 뒤로가기)
 */
export type ModalCloseButton = "header" | "outside" | "none";

export interface ModalClassNames {
  /** 카드를 감싸는 다이얼로그 영역 — 폭을 지정합니다. */
  dialog?: string;
  /** 흰 카드 — 여백과 자식 간 간격을 지정합니다. */
  panel?: string;
  /** 제목 타이포그래피 */
  title?: string;
}

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** 헤더 제목. 생략하면 헤더 영역이 렌더링되지 않습니다. */
  title?: string;
  children: ReactNode;
  /** 본문 아래 액션 영역 */
  footer?: ReactNode;
  closeButton?: ModalCloseButton;
  classNames?: ModalClassNames;
}

/**
 * 공통 모달
 *
 * - 데스크톱: 화면 중앙 카드 (rounded-16 · px-40 py-36)
 * - 모바일: 좌우 20px 여백 안에서 전체 폭
 *
 * 제목·본문·footer는 카드의 직접 자식이라 `classNames.panel`의 gap이 셋 사이
 * 간격을 함께 정합니다.
 *
 * 열려 있는 동안 body 스크롤을 잠그고, ESC와 배경 클릭으로 닫습니다.
 * 포커스는 열릴 때 모달 안으로 옮기고 Tab을 모달 내부로 가둡니다.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  closeButton = "header",
  classNames,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useDialogBehavior(open, onClose, dialogRef);

  if (!open) return null;

  const closeIcon = (
    <span className="flex size-5 items-center justify-center overflow-clip rounded-lg">
      <Icon name="close" size={14} />
    </span>
  );

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/35 px-5 py-10"
      onClick={onClose}
    >
      {/*
       * 닫기 버튼이 카드 바깥에 올 수 있어 다이얼로그 경계를 카드보다 한 단계
       * 넓게 잡습니다. my-auto는 카드가 화면보다 길어졌을 때 위가 잘리는 것을
       * 막습니다.
       */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        onClick={(event) => event.stopPropagation()}
        className={cn("my-auto flex w-full flex-col gap-2 md:w-[572px]", classNames?.dialog)}
      >
        {closeButton === "outside" && (
          <div className="flex justify-end">
            <button
              type="button"
              aria-label="닫기"
              onClick={onClose}
              className="flex items-center p-2.5 text-white transition-opacity hover:opacity-70 md:rounded-lg md:bg-white/50 md:p-3 md:text-grayscale-800"
            >
              {closeIcon}
            </button>
          </div>
        )}

        <div
          className={cn(
            "flex w-full flex-col gap-6 rounded-2xl bg-white p-5 md:px-10 md:py-9",
            classNames?.panel,
          )}
        >
          {title && (
            <div className="flex shrink-0 items-center justify-between">
              <h2
                id={titleId}
                className={cn("text-heading-1 font-medium text-grayscale-900", classNames?.title)}
              >
                {title}
              </h2>
              {closeButton === "header" && (
                <button
                  type="button"
                  aria-label="닫기"
                  onClick={onClose}
                  className="flex items-center p-3 transition-opacity hover:opacity-70"
                >
                  {closeIcon}
                </button>
              )}
            </div>
          )}

          {children}

          {footer && <div className="shrink-0">{footer}</div>}
        </div>
      </div>
    </div>,
    document.body,
  );
}
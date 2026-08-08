"use client";

import { Icon } from "@/shared/ui/icons";
import { Modal } from "@/shared/ui/modal";

import type { TermId } from "../model/terms";
import { TERMS } from "../model/terms";
import { getTermsPageSources } from "../model/terms-document";

export interface TermsDocumentModalProps {
  termId: TermId;
  onClose: () => void;
}

/** Figma 652:13333 — 오른쪽 6px 커스텀 스크롤바 */
const SCROLLBAR =
  "[scrollbar-color:var(--color-grayscale-300)_var(--color-grayscale-100)] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-grayscale-300 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-grayscale-100 [&::-webkit-scrollbar]:w-1.5";

/**
 * 약관 전문 모달 (Figma: 646:28085)
 *
 * 약관 본문은 스캔 이미지라 쪽 이미지를 세로로 이어 붙이고 카드 안에서
 * 스크롤합니다. 카드 왼쪽 위 뒤로가기 버튼으로 닫습니다.
 *
 * 모바일 시안이 없어 카드 높이만 화면에 맞추고 나머지 규칙은 데스크톱과
 * 동일하게 뒀습니다.
 */
export function TermsDocumentModal({ termId, onClose }: TermsDocumentModalProps) {
  const term = TERMS.find((item) => item.id === termId);
  const pages = getTermsPageSources(termId);

  return (
    <Modal
      open
      onClose={onClose}
      /* 제목은 약관 이미지 안에 그려져 있어 화면에는 숨기고 이름만 남깁니다. */
      title={term?.label ?? "약관 전문"}
      closeButton="none"
      classNames={{
        dialog: "md:w-[870px] md:max-w-[870px]",
        panel: "relative h-[80vh] gap-0 overflow-hidden p-0 md:h-[800px] md:p-0",
        title: "sr-only",
      }}
    >
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute top-0 left-0 z-10 flex size-15 items-center justify-center text-grayscale-900 transition-opacity hover:opacity-70"
      >
        <Icon name="arrow_back_ios_new" size={20} />
      </button>

      <div className={`min-h-0 flex-1 overflow-y-auto py-15 ${SCROLLBAR}`}>
        <div className="mx-auto flex w-full flex-col md:w-[565px]">
          {pages.map((source, index) => (
            /* eslint-disable-next-line @next/next/no-img-element -- 원본 크기를 모르는 public 스캔 이미지라 next/image의 width/height를 줄 수 없습니다. */
            <img
              key={source}
              src={source}
              alt={`${term?.label ?? "약관"} ${index + 1}쪽`}
              loading={index === 0 ? "eager" : "lazy"}
              className="block h-auto w-full"
            />
          ))}
        </div>
      </div>
    </Modal>
  );
}

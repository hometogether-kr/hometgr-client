"use client";

import { useState } from "react";

import type { BankCode, BankOption } from "@/domains/settlement";
import { BtnCta } from "@/shared/ui/btn-cta";
import { ChipNormal } from "@/shared/ui/chip-normal";
import { Modal } from "@/shared/ui/modal";

export interface BankSelectModalProps {
  options: readonly BankOption[];
  /** 이미 선택돼 있던 은행. 모달을 열 때의 초기 선택으로만 쓰입니다. */
  selected: BankCode | null;
  onConfirm: (bank: BankCode) => void;
  onClose: () => void;
  /** 은행 목록을 불러오는 중이면 칩 자리에 스켈레톤을 보여줍니다. */
  loading?: boolean;
}

/** Figma 703:23915 — 스켈레톤도 3열 8행 그리드를 그대로 채웁니다. */
const SKELETON_COUNT = 24;

/** 스켈레톤 막대 너비 (Figma 703:24027 · 24058 · 24086) */
const SKELETON_BAR_WIDTHS = ["w-[42px]", "w-[56px]", "w-[28px]"] as const;

/** 모바일 42px · 데스크톱 60px 칩 (Figma 703:23476 · 643:19934) */
const CHIP_SIZE = "h-[42px] md:h-[60px] md:rounded-xl md:text-[17px]";

const GRID = "grid grid-cols-3 gap-3 md:gap-x-[18px] md:gap-y-[15px]";

function BankGridSkeleton() {
  return (
    <div className={GRID} aria-hidden="true">
      {Array.from({ length: SKELETON_COUNT }, (_, index) => (
        <div
          key={index}
          className={`flex items-center justify-center rounded-lg border border-solid border-grayscale-300 ${CHIP_SIZE}`}
        >
          <span
            className={`h-[6px] animate-pulse rounded-full bg-grayscale-300 ${SKELETON_BAR_WIDTHS[index % SKELETON_BAR_WIDTHS.length]}`}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * 은행 선택 모달 (Figma: 모바일 703:23579 · 로딩 703:23861 · 데스크톱 643:19923)
 *
 * 은행명은 드롭다운을 펼치는 대신 이 모달을 띄워 고릅니다. 칩을 눌러도 값은
 * 아직 확정되지 않고, "선택 완료"를 눌러야 폼에 반영됩니다.
 *
 * 제목·그리드·버튼 간격은 시안이 모바일 22/23px, 데스크톱 28/25px로 미세하게
 * 다른데, 공용 모달이 셋을 같은 gap으로 묶으므로 각각 22px·28px로 맞췄습니다.
 *
 * 열림 여부는 부모가 조건부 렌더링으로 관리합니다. 그래야 모달이 열릴 때마다
 * 새로 마운트되어 임시 선택이 초기값으로 자연스럽게 되돌아갑니다.
 */
export function BankSelectModal({
  options,
  selected,
  onConfirm,
  onClose,
  loading = false,
}: BankSelectModalProps) {
  const [draft, setDraft] = useState<BankCode | null>(selected);

  return (
    <Modal
      open
      onClose={onClose}
      title="은행을 선택해주세요"
      closeButton="outside"
      classNames={{
        dialog: "max-w-[337px] md:w-[526px] md:max-w-[526px]",
        panel: "gap-[22px] px-8 py-12 md:gap-7 md:px-16 md:py-12",
        title: "text-heading-2 text-grayscale-800",
      }}
      footer={
        <BtnCta
          size="m"
          className="h-11 w-full md:h-[52px] md:text-body-1"
          disabled={draft === null}
          onClick={() => draft && onConfirm(draft)}
        >
          선택 완료
        </BtnCta>
      }
    >
      {loading ? (
        <BankGridSkeleton />
      ) : (
        // 선택 상태는 ChipNormal이 aria-pressed로 알립니다.
        <div className={GRID} aria-label="은행 목록">
          {options.map((option) => (
            <ChipNormal
              key={option.value}
              shape="square"
              size="s"
              selected={draft === option.value}
              onClick={() => setDraft(option.value)}
              /*
               * 칩 기본 좌우 여백(16px)을 없앱니다. 글자는 어차피 가운데 정렬이라
               * 여백은 "iM뱅크(대구)" 같은 긴 이름을 잘라먹는 역할만 합니다.
               * Figma의 고정폭 칩도 같은 방식으로 렌더링됩니다.
               */
              className={`w-full overflow-hidden px-0 ${CHIP_SIZE}`}
            >
              {option.label}
            </ChipNormal>
          ))}
        </div>
      )}
    </Modal>
  );
}

import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

interface FilterChipProps {
  /** 미선택: 카테고리명("지역") · 선택: 요약 값("강남구") — 요약 라벨은 D에서 채웁니다 */
  label: string;
  /** 해당 조건이 설정돼 있는지 */
  active: boolean;
  /** 이 칩이 연 모달이 열려 있는지 */
  expanded: boolean;
  /** 필터 칩만 좌측에 ic_filter */
  leftIcon?: ReactNode;
  onClick: () => void;
}

/**
 * 필터 칩 (Figma: chip_filter)
 *
 * 모달을 여는 트리거이므로 `aria-haspopup="dialog"`. 활성 상태 색은 피그마에 없어
 * `ChipNormal`의 selected 토큰을 따릅니다(`bg-primary-100`·`border-primary-500`·
 * `text-primary-600` — 설계 §6.3, 디자이너 확인 요청). Reading 계열 타이포라
 * `leading-normal`을 덧붙입니다(§1-5).
 */
export function FilterChip({ label, active, expanded, leftIcon, onClick }: FilterChipProps) {
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-expanded={expanded}
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-lg border px-3 py-1.5 text-label-2 font-medium leading-normal transition-colors",
        "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:outline-none",
        active
          ? "border-primary-500 bg-primary-100 text-primary-600"
          : "border-grayscale-200 text-grayscale-700 hover:bg-grayscale-50",
      )}
    >
      {leftIcon && (
        <span className="inline-flex size-4 shrink-0 items-center justify-center">{leftIcon}</span>
      )}
      {label}
    </button>
  );
}
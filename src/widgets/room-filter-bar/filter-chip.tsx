import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";
import { Icon } from "@/shared/ui/icons";

interface FilterChipProps {
  /** 미선택: 카테고리명("지역") · 선택: 요약 값("강남구") */
  label: string;
  /** 해당 조건이 설정돼 있는지 */
  active: boolean;
  /** 이 칩이 연 모달이 열려 있는지 */
  expanded: boolean;
  /**
   * "all" = 전체 필터 진입 칩(좌측 ic_filter, 우측 아이콘 없음, 활성 시 파란 테두리만).
   * "category" = 카테고리 칩(우측 꺾쇠, 활성 시 회색 배경 + X 해제 아이콘). 기본값.
   */
  variant?: "all" | "category";
  /** 필터 칩만 좌측에 ic_filter */
  leftIcon?: ReactNode;
  onClick: () => void;
}

/**
 * 필터 칩 (Figma: chip_filter · 1061:39358)
 *
 * 모달을 여는 트리거이므로 `aria-haspopup="dialog"`. 활성 상태는 칩 종류로 갈립니다:
 * 카테고리 칩은 G800 배경 + 흰 텍스트 + X 해제 아이콘(Label 1, 14/1.4), 전체 "필터" 칩은
 * 배경 없이 primary-600 테두리·텍스트(Label 2, 13 유지). 미선택은 공통으로 G200 테두리 +
 * Reading 타이포(Label 2, leading-normal)에 우측 꺾쇠(카테고리 칩만)입니다.
 */
export function FilterChip({
  label,
  active,
  expanded,
  variant = "category",
  leftIcon,
  onClick,
}: FilterChipProps) {
  const isAll = variant === "all";

  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-expanded={expanded}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3 font-medium transition-colors",
        "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:outline-none",
        !active &&
          "border-grayscale-200 text-label-2 leading-normal text-grayscale-700 hover:bg-grayscale-50",
        active &&
          (isAll
            ? "border-primary-600 text-label-2 leading-normal text-primary-600"
            : "border-transparent bg-grayscale-800 text-label-1 text-white"),
      )}
    >
      {leftIcon && (
        <span className="inline-flex size-4 shrink-0 items-center justify-center">{leftIcon}</span>
      )}
      {label}
      {!isAll && (
        <Icon
          name={active ? "close" : "keyboard_arrow_down"}
          size={16}
          className="shrink-0"
          aria-hidden
        />
      )}
    </button>
  );
}
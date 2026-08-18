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
   * "category" = 카테고리 칩(미선택 우측 꺾쇠, 활성 시 회색 배경 + X 해제 버튼). 기본값.
   */
  variant?: "all" | "category";
  /** 필터 칩만 좌측에 ic_filter */
  leftIcon?: ReactNode;
  /** 칩 본체 클릭 — 지정된 탭으로 모달 열기 */
  onClick: () => void;
  /** 활성 카테고리 칩의 X(해제) 클릭 — 해당 필드만 초기화. 없으면 X 대신 라벨만 렌더 */
  onClear?: () => void;
}

const PILL = "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3 font-medium";
const FOCUS =
  "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:outline-none";

/**
 * 필터 칩 (Figma: chip_filter · 1061:39358)
 *
 * 모달을 여는 트리거이므로 `aria-haspopup="dialog"`. 활성 카테고리 칩은 G800 배경 + 흰
 * 텍스트에 **X 해제 버튼**을 별도 버튼으로 둡니다 — 라벨(모달 열기)과 X(해제)가 서로 다른
 * 동작이라 버튼을 분리했습니다(버튼 중첩 금지). 전체 "필터" 칩은 배경 없이 primary-600
 * 테두리(13 유지), 미선택은 공통으로 G200 테두리 + Reading 타이포 + 우측 꺾쇠(카테고리 칩만)입니다.
 */
export function FilterChip({
  label,
  active,
  expanded,
  variant = "category",
  leftIcon,
  onClick,
  onClear,
}: FilterChipProps) {
  const isAll = variant === "all";

  // 활성 카테고리 칩: 라벨 버튼(모달) + X 버튼(해제)을 분리. X 클릭은 모달을 열지 않습니다.
  if (!isAll && active && onClear) {
    return (
      <div className={cn(PILL, "border-transparent bg-grayscale-800 text-label-1 text-white")}>
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={expanded}
          onClick={onClick}
          className={cn("rounded-sm", FOCUS, "focus-visible:ring-white")}
        >
          {label}
        </button>
        <button
          type="button"
          aria-label={`${label} 필터 해제`}
          onClick={onClear}
          className={cn(
            "flex shrink-0 items-center rounded-full p-0.5 transition-opacity hover:opacity-70",
            FOCUS,
            "focus-visible:ring-white focus-visible:ring-offset-0",
          )}
        >
          <Icon name="close" size={16} />
        </button>
      </div>
    );
  }

  // 그 외: 단일 버튼 (미선택 카테고리=꺾쇠 / 전체 필터 칩=좌측 아이콘·활성 시 파란 테두리)
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-expanded={expanded}
      onClick={onClick}
      className={cn(
        PILL,
        "transition-colors",
        FOCUS,
        !active &&
          "border-grayscale-200 text-label-2 leading-normal text-grayscale-700 hover:bg-grayscale-50",
        active && "border-primary-600 text-label-2 leading-normal text-primary-600",
      )}
    >
      {leftIcon && (
        <span className="inline-flex size-4 shrink-0 items-center justify-center">{leftIcon}</span>
      )}
      {label}
      {!isAll && !active && (
        <Icon name="keyboard_arrow_down" size={16} className="shrink-0" aria-hidden />
      )}
    </button>
  );
}
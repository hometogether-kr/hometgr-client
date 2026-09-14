import { cn } from "@/shared/lib/cn";

import type { RoomAvailability } from "../model/room";

interface RoomAvailabilityChipProps {
  availability: RoomAvailability;
  className?: string;
}

interface ChipStyle {
  container: string;
  dot: string;
  label: string;
}

/** 설계 §6.2 — 배경/점/텍스트 토큰과 문구 */
const CHIP_STYLE: Record<RoomAvailability, ChipStyle> = {
  available: {
    container: "bg-white/90 text-grayscale-800",
    dot: "bg-primary-500",
    label: "지금 예약 가능",
  },
  unavailable: {
    container: "bg-grayscale-200 text-grayscale-500",
    dot: "bg-grayscale-400",
    label: "현재 입주 불가",
  },
};

/**
 * 매물 카드 사진 위에 얹는 가용성 칩 (Figma `chip_availability`)
 *
 * 점은 SVG 없이 단색 원(`size-1.5 rounded-full`)으로 그립니다.
 */
export function RoomAvailabilityChip({ availability, className }: RoomAvailabilityChipProps) {
  const style = CHIP_STYLE[availability];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-label-1 font-medium",
        style.container,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", style.dot)} aria-hidden="true" />
      {style.label}
    </span>
  );
}

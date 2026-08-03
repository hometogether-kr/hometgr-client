import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

export type ChipNormalShape = "round" | "square";
export type ChipNormalSize = "s" | "m" | "lg";

export interface ChipNormalProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Figma: chip_normal / type (round · square). round는 s·m, square는 m·lg 조합이 디자인에 존재 */
  shape?: ChipNormalShape;
  /** Figma: chip_normal / size */
  size?: ChipNormalSize;
  /** Figma: Property 1 = Selected */
  selected?: boolean;
  children: ReactNode;
}

const shapeSizeClasses: Record<ChipNormalShape, Record<ChipNormalSize, string>> = {
  round: {
    s: "rounded-[20px] px-3 py-2 text-xs tracking-[0.12px]",
    m: "rounded-[20px] px-4 py-2 text-sm",
    lg: "rounded-[20px] px-4 py-2 text-sm",
  },
  square: {
    s: "h-[42px] rounded-lg px-4 py-2 text-[13px]",
    m: "h-[42px] rounded-lg px-4 py-2 text-[13px]",
    lg: "h-[60px] rounded-xl px-4 py-3 text-[17px]",
  },
};

/**
 * 칩 (Figma: chip_normal, node 171:1810)
 *
 * - Default: border grayscale-300 · text grayscale-500
 * - Selected: bg primary-100 · border primary-500 · text primary-600
 * - Figma의 고정 너비(69/80/120px)는 인스턴스 예시 값 — 기본 내용 너비,
 *   그리드 배치 시 className="w-20" 등으로 지정
 */
export function ChipNormal({
  shape = "round",
  size = "m",
  selected = false,
  className,
  children,
  ...rest
}: ChipNormalProps) {
  const isRoundDefault = shape === "round" && !selected;
  const classes = cn(
    "inline-flex items-center justify-center border border-solid text-center leading-[1.4] whitespace-nowrap transition-colors",
    shapeSizeClasses[shape][size],
    isRoundDefault ? "font-medium" : "font-semibold",
    selected
      ? "border-primary-500 bg-primary-100 text-primary-600"
      : "border-grayscale-300 bg-white text-grayscale-500",
    className,
  );

  return (
    <button type="button" aria-pressed={selected} className={classes} {...rest}>
      {children}
    </button>
  );
}

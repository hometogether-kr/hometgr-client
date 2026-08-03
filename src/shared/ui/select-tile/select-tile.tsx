import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export interface SelectTileProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  children: ReactNode;
}

/**
 * 선택 타일 (Figma: btn_card / mode=Default, node 427:16247)
 *
 * - 컨트롤 없이 텍스트만 있는 선택 카드
 * - 기본: border grayscale-200 · text grayscale-500
 * - 선택: border primary-400 · bg primary-50 · text primary-600
 */
export function SelectTile({ selected = false, className, children, ...rest }: SelectTileProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "flex flex-1 items-center justify-center rounded-xl border border-solid px-5 py-3 text-base font-semibold leading-[1.5] transition-colors",
        selected
          ? "border-primary-400 bg-primary-50 text-primary-600"
          : "border-grayscale-200 bg-white text-grayscale-500",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

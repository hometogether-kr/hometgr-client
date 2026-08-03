import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

export type BtnTextSize = "14" | "16" | "20";

export interface BtnTextProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Figma: btn_text / size (14 · 16 · 20) */
  size?: BtnTextSize;
  /** Figma: Property 1 = selected. hover 상태는 CSS :hover로 처리 */
  selected?: boolean;
  /** Figma: right_ic — ic_variant 슬롯. 프로젝트 아이콘을 그대로 넣어 사용 */
  rightIcon?: ReactNode;
  children: ReactNode;
}

const sizeClasses: Record<BtnTextSize, string> = {
  "14": "text-sm",
  "16": "text-base",
  "20": "text-xl",
};

const iconSize: Record<BtnTextSize, string> = {
  "14": "[&_svg]:size-[18px]",
  "16": "[&_svg]:size-5",
  "20": "[&_svg]:size-5",
};

/**
 * 텍스트 버튼 (Figma: btn_text, node 155:2352)
 *
 * - default: Medium · grayscale-700
 * - hover: SemiBold · grayscale-800 (CSS :hover)
 * - selected: Bold · primary-500 (selected prop)
 */
export function BtnText({
  size = "14",
  selected = false,
  rightIcon,
  className,
  children,
  ...rest
}: BtnTextProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-1 leading-5 whitespace-nowrap",
    sizeClasses[size],
    iconSize[size],
    selected
      ? "font-bold text-primary-500"
      : "font-medium text-grayscale-700 hover:font-semibold hover:text-grayscale-800",
    className,
  );

  return (
    <button type="button" aria-pressed={selected} className={classes} {...rest}>
      <span className="[word-break:break-word]">{children}</span>
      {rightIcon && (
        <span className="inline-flex h-5 shrink-0 flex-col items-center justify-center">
          {rightIcon}
        </span>
      )}
    </button>
  );
}

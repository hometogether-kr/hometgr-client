import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

export type BtnIcSize = "40" | "44" | "48" | "64";
export type BtnIcShape = "ellipse" | "square";
export type BtnIcTone = "default" | "dark";

export interface BtnIcProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Figma: btn_ic / size */
  size?: BtnIcSize;
  /** Figma: btn_ic / type (ellipse · square) */
  shape?: BtnIcShape;
  /** default: bg grayscale-100 · dark: bg grayscale-800 */
  tone?: BtnIcTone;
  /** 접근성 라벨 (아이콘 전용 버튼이므로 필수) */
  label: string;
  children: ReactNode;
}

const sizeClasses: Record<BtnIcSize, string> = {
  "40": "size-10 [&_img]:size-5 [&_svg]:size-5",
  "44": "size-11 [&_img]:size-5 [&_svg]:size-5",
  "48": "size-12 [&_img]:size-6 [&_svg]:size-6",
  "64": "size-16 [&_img]:size-7 [&_svg]:size-7",
};

const toneClasses: Record<BtnIcTone, string> = {
  default: "bg-grayscale-100",
  dark: "bg-grayscale-800",
};

/**
 * 아이콘 버튼 (Figma: btn_ic, node 166:825 · 622:20735)
 *
 * - ellipse: rounded-full · square: rounded-lg
 */
export function BtnIc({
  size = "64",
  shape = "ellipse",
  tone = "default",
  label,
  className,
  children,
  ...rest
}: BtnIcProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "flex shrink-0 items-center justify-center overflow-clip transition-opacity hover:opacity-80",
        shape === "ellipse" ? "rounded-full" : "rounded-lg",
        toneClasses[tone],
        sizeClasses[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

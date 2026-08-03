import type { InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

export type RadioSize = "20" | "24" | "32";

export interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  /** Figma: radio / size (20 · 24 · 32) — 히트 영역 크기 */
  size?: RadioSize;
}

const wrapperPadding: Record<RadioSize, string> = {
  "20": "p-0.5",
  "24": "p-0.5",
  "32": "p-[3px]",
};

const boxClasses: Record<RadioSize, string> = {
  "20": "size-4 border-[1.5px]",
  "24": "size-5 border-[1.5px]",
  "32": "size-[27px] border-2",
};

const dotClasses: Record<RadioSize, string> = {
  "20": "size-1.5",
  "24": "size-2",
  "32": "size-2.5",
};

/**
 * 라디오 버튼 (Figma: radio, node 318:7143)
 *
 * - Default: border grayscale-200
 * - Selected: bg·border primary-500 + 흰색 도트 (CSS 원 — Figma의 Icon/Normal/Dot는
 *   단순 흰색 원이라 별도 에셋 없이 구현)
 * - disable: opacity 43%
 * - 순수 CSS(peer-checked)라 클라이언트 훅 불필요 — name 그룹으로 언컨트롤드 사용 가능
 */
export function Radio({ size = "20", disabled, className, ...rest }: RadioProps) {
  return (
    <label
      className={cn(
        "relative inline-flex items-center justify-center",
        wrapperPadding[size],
        disabled ? "cursor-not-allowed opacity-[0.43]" : "cursor-pointer",
        className,
      )}
    >
      <input type="radio" disabled={disabled} className="peer sr-only" {...rest} />
      <span
        aria-hidden="true"
        className={cn(
          "flex items-center justify-center rounded-full border-solid border-grayscale-200 transition-colors",
          "peer-checked:border-primary-500 peer-checked:bg-primary-500",
          "[&>span]:opacity-0 peer-checked:[&>span]:opacity-100",
          boxClasses[size],
        )}
      >
        <span className={cn("rounded-full bg-white", dotClasses[size])} />
      </span>
    </label>
  );
}

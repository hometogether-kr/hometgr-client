import type { HTMLAttributes } from "react";

import { cn } from "@/shared/lib/cn";

export type ToggleMode = "web" | "mobile";

export interface ToggleOption<T extends string> {
  label: string;
  value: T;
}

export interface ToggleProps<T extends string> extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange"
> {
  /** 두 개의 세그먼트 옵션 (Figma 예시: 정산예정 · 정산완료) */
  options: readonly [ToggleOption<T>, ToggleOption<T>];
  /** 현재 선택된 값 */
  value: T;
  onChange?: (value: T) => void;
  /** Figma: mode (web · mobile) */
  mode?: ToggleMode;
}

const trackClasses: Record<ToggleMode, string> = {
  web: "gap-2 px-2.5 pt-[7px] pb-1.5",
  mobile: "gap-[5px] px-1.5 pt-1 pb-[3px]",
};

const segmentClasses: Record<ToggleMode, string> = {
  web: "p-2.5 text-sm font-bold border-[1.4px]",
  mobile: "p-1.5 text-[11px] font-semibold tracking-[0.11px] border",
};

/**
 * 세그먼티드 토글 (Figma: toggle, node 350:7391)
 *
 * - 선택 세그먼트: bg primary-100 · border primary-500 · text primary-500
 * - 비선택 세그먼트: 투명 배경 · text grayscale-500
 * - Figma의 고정 너비(492/316px)는 예시 값 — 세그먼트는 flex-1로 균등 분할,
 *   전체 너비는 className으로 지정 (예: className="w-[492px]")
 */
export function Toggle<T extends string>({
  options,
  value,
  onChange,
  mode = "web",
  className,
  ...rest
}: ToggleProps<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center rounded-full bg-grayscale-100",
        trackClasses[mode],
        className,
      )}
      {...rest}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange?.(option.value)}
            className={cn(
              "flex flex-1 items-center justify-center rounded-full leading-[1.4] whitespace-nowrap transition-colors",
              segmentClasses[mode],
              selected
                ? "border-solid border-primary-500 bg-primary-100 text-primary-500"
                : "border-transparent text-grayscale-500",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

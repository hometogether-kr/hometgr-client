"use client";

import type { InputHTMLAttributes, ReactNode } from "react";
import { useEffect, useRef } from "react";

import { cn } from "@/shared/lib/cn";
import { Icon } from "@/shared/ui/icons";

export type CheckboxSize = "20" | "24" | "32";

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "type"
> {
  /** Figma: checkbox / size (20 · 24 · 32) — 히트 영역 크기 */
  size?: CheckboxSize;
  /** Figma: Property 1 = interminate — 전체선택 등 부분 선택 상태 */
  indeterminate?: boolean;
  /** 체크/부분선택 아이콘 (기본값: Material Symbols check / remove) */
  checkIcon?: ReactNode;
  indeterminateIcon?: ReactNode;
}

const wrapperPadding: Record<CheckboxSize, string> = {
  "20": "p-0.5",
  "24": "p-[3px]",
  "32": "p-1",
};

const boxClasses: Record<CheckboxSize, string> = {
  "20": "size-4 rounded-[5px] border-[1.5px]",
  "24": "size-[18px] rounded-[5px] border-[1.5px]",
  "32": "size-6 rounded-[7px] border-2",
};

const iconClasses: Record<CheckboxSize, string> = {
  "20": "size-3.5",
  "24": "size-4",
  "32": "size-[21px]",
};

const iconSizePx: Record<CheckboxSize, number> = {
  "20": 14,
  "24": 16,
  "32": 21,
};

/**
 * 체크박스 (Figma: checkbox, node 318:6855)
 *
 * - Default: border grayscale-200
 * - checked / indeterminate: bg·border primary-500 + 흰색 아이콘
 * - disable: opacity 60%
 */
export function Checkbox({
  size = "20",
  indeterminate = false,
  checkIcon,
  indeterminateIcon,
  checked,
  disabled,
  className,
  ...rest
}: CheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const active = checked || indeterminate;

  return (
    <label
      className={cn(
        "relative inline-flex cursor-pointer items-center justify-center",
        wrapperPadding[size],
        disabled ? "cursor-not-allowed opacity-60" : "",
        className,
      )}
    >
      <input
        ref={inputRef}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        className="peer sr-only"
        {...rest}
      />
      <span
        aria-hidden="true"
        className={cn(
          "flex items-center justify-center border-solid transition-colors",
          boxClasses[size],
          active ? "border-primary-500 bg-primary-500" : "border-grayscale-200 bg-transparent",
        )}
      >
        {indeterminate ? (
          <span className={cn("flex items-center justify-center", iconClasses[size])}>
            {indeterminateIcon ?? (
              <Icon name="remove" size={iconSizePx[size]} filled className="text-white" />
            )}
          </span>
        ) : checked ? (
          <span className={cn("flex items-center justify-center", iconClasses[size])}>
            {checkIcon ?? (
              <Icon name="check" size={iconSizePx[size]} filled className="text-white" />
            )}
          </span>
        ) : null}
      </span>
    </label>
  );
}

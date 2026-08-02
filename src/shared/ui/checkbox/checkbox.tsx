"use client";

import { useEffect, useRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";

export type CheckboxSize = "20" | "24" | "32";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  /** Figma: checkbox / size (20 · 24 · 32) — 히트 영역 크기 */
  size?: CheckboxSize;
  /** Figma: Property 1 = interminate — 전체선택 등 부분 선택 상태 */
  indeterminate?: boolean;
  /**
   * 체크/부분선택 아이콘 (Figma: ic_check, Line Horizontal).
   * TODO: 기본값은 7일 후 만료되는 Figma 임시 에셋 URL — Figma에서 export해
   * public/icons 또는 public/figma에 커밋한 뒤 교체하세요.
   */
  checkIcon?: ReactNode;
  indeterminateIcon?: ReactNode;
}

const FIGMA_TEMP_CHECK = "https://www.figma.com/api/mcp/asset/4df91953-2163-40df-bb89-8513a0f851d7";
const FIGMA_TEMP_LINE = "https://www.figma.com/api/mcp/asset/1e8a876e-b1f4-4d75-a674-538a17265125";

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
      className={[
        "relative inline-flex cursor-pointer items-center justify-center",
        wrapperPadding[size],
        disabled ? "cursor-not-allowed opacity-60" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
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
        className={[
          "flex items-center justify-center border-solid transition-colors",
          boxClasses[size],
          active ? "border-primary-500 bg-primary-500" : "border-grayscale-200 bg-transparent",
        ].join(" ")}
      >
        {indeterminate ? (
          <span className={["flex items-center justify-center", iconClasses[size]].join(" ")}>
            {indeterminateIcon ?? (
              // eslint-disable-next-line @next/next/no-img-element -- 임시 Figma 에셋, 커밋된 SVG로 교체 예정
              <img alt="" src={FIGMA_TEMP_LINE} className="block size-full max-w-none" />
            )}
          </span>
        ) : checked ? (
          <span className={["flex items-center justify-center", iconClasses[size]].join(" ")}>
            {checkIcon ?? (
              // eslint-disable-next-line @next/next/no-img-element -- 임시 Figma 에셋, 커밋된 SVG로 교체 예정
              <img alt="" src={FIGMA_TEMP_CHECK} className="block size-full max-w-none" />
            )}
          </span>
        ) : null}
      </span>
    </label>
  );
}

"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";

export interface DropdownOption<T extends string> {
  label: string;
  value: T;
  /** Figma: 옵션 우측 아이콘 슬롯 (예: 기간 직접 선택 + 캘린더 아이콘) */
  icon?: ReactNode;
}

export interface DropdownProps<T extends string> {
  options: readonly DropdownOption<T>[];
  value?: T;
  onChange?: (value: T) => void;
  /** 선택 전 트리거에 표시할 텍스트 (Figma 예시: "Select") */
  placeholder?: string;
  /**
   * 트리거 우측 화살표 아이콘 (Figma: ic_arrow).
   * TODO: 기본값은 7일 후 만료되는 Figma 임시 에셋 URL — Figma에서 ic_arrow를
   * SVG로 export해 public/icons/ic-arrow.svg로 커밋한 뒤 교체하세요.
   */
  arrowIcon?: ReactNode;
  disabled?: boolean;
  className?: string;
}

const IC_ARROW_DOWN = "/figma/ic-arrow-down-2f96af07.svg";

/**
 * 드롭다운 (Figma: dropdown, node 536:8573)
 *
 * - close: border grayscale-300 · 텍스트 grayscale-900
 * - open: 트리거 border primary-500 · 화살표 180° 회전 · 하단 옵션 리스트
 * - 옵션: h-48 · border-b grayscale-300 · hover bg grayscale-200 · 선택 항목 semibold
 */
export function Dropdown<T extends string>({
  options,
  value,
  onChange,
  placeholder = "Select",
  arrowIcon,
  disabled = false,
  className,
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={["relative flex w-full flex-col gap-2", className].filter(Boolean).join(" ")}
    >
      <button
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-controls={listId}
        aria-haspopup="listbox"
        onClick={() => setOpen((prev) => !prev)}
        className={[
          "flex h-12 w-full items-center justify-between rounded-lg border border-solid bg-white px-3 py-3 transition-colors",
          open ? "border-primary-500" : "border-grayscale-300",
          disabled ? "cursor-not-allowed bg-grayscale-100" : "",
        ].join(" ")}
      >
        <span className="whitespace-nowrap text-base font-medium leading-[1.5] text-grayscale-900">
          {selected?.label ?? placeholder}
        </span>
        <span
          className={[
            "flex size-5 shrink-0 items-center justify-center p-1 transition-transform",
            open ? "rotate-180" : "",
          ].join(" ")}
          aria-hidden="true"
        >
          {arrowIcon ?? (
            // eslint-disable-next-line @next/next/no-img-element -- 임시 Figma 에셋, 커밋된 SVG로 교체 예정
            <img alt="" src={IC_ARROW_DOWN} className="block size-full max-w-none" />
          )}
        </span>
      </button>
      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute top-full z-10 mt-2 w-full overflow-hidden rounded-lg border border-solid border-grayscale-300 bg-white"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                className={index < options.length - 1 ? "border-b border-solid border-grayscale-300" : ""}
              >
                <button
                  type="button"
                  onClick={() => {
                    onChange?.(option.value);
                    setOpen(false);
                  }}
                  className={[
                    "flex h-12 w-full items-center justify-between bg-white p-3 text-left text-base leading-[1.5] text-grayscale-800 transition-colors hover:bg-grayscale-200",
                    isSelected ? "font-semibold" : "font-medium",
                  ].join(" ")}
                >
                  <span className="whitespace-nowrap">{option.label}</span>
                  {option.icon && (
                    <span className="flex size-6 shrink-0 items-center justify-center" aria-hidden="true">
                      {option.icon}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

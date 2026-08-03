"use client";

import type { ChangeEvent, ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

import { Checkbox } from "../checkbox";
import { Radio } from "../radio";

export interface BtnCardProps {
  /** Figma: btn_card / radio · checkbox — 선택 컨트롤 종류 */
  control?: "radio" | "checkbox";
  title: string;
  /** Figma: subtitle */
  description?: string;
  checked?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  /** radio 그룹 이름 */
  name?: string;
  value?: string;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
}

/**
 * 선택 카드 (Figma: btn_card, node 133:1094)
 *
 * - 기본: border grayscale-200 · rounded-16 · px-24 py-16
 * - 선택 시: border primary-500 · bg primary-100 (Figma selected 상태)
 * - 내부 컨트롤은 공통 Radio · Checkbox 재사용
 */
export function BtnCard({
  control = "radio",
  title,
  description,
  checked = false,
  onChange,
  name,
  value,
  disabled,
  className,
  children,
}: BtnCardProps) {
  return (
    <label
      className={cn(
        "flex w-full items-center gap-4 rounded-xl border border-solid px-4 py-3 transition-colors md:gap-5 md:rounded-2xl md:px-6 md:py-4",
        checked ? "border-primary-400 bg-primary-50" : "border-grayscale-200 bg-white",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        className,
      )}
    >
      {control === "radio" ? (
        <Radio
          size="32"
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
        />
      ) : (
        <Checkbox
          size="32"
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
        />
      )}
      <span className="flex flex-col items-start gap-1.5">
        <span
          className={cn(
            "text-base leading-[1.5] font-semibold md:text-lg md:leading-[1.4] md:tracking-[-0.18px] md:whitespace-nowrap",
            checked ? "text-primary-600" : "text-grayscale-500",
          )}
        >
          {title}
        </span>
        {description && (
          <span
            className={cn(
              "text-[13px] leading-[1.5] font-medium md:text-sm",
              checked ? "text-primary-500" : "text-grayscale-500",
            )}
          >
            {description}
          </span>
        )}
        {children}
      </span>
    </label>
  );
}

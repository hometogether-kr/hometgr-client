"use client";

import { useId } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

export interface DateFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: string;
  error?: string;
}

/**
 * 날짜 선택 필드 (Figma: 입주 가능일, node 420:7076)
 *
 * - 네이티브 date 입력을 사용해 브라우저 기본 캘린더 피커를 그대로 활용
 * - Figma의 ic_Calender는 네이티브 피커 아이콘으로 대체
 */
export function DateField({ label, error, className, id, ...rest }: DateFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <div className={cn("flex flex-col items-start gap-2", className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="w-full text-sm font-medium leading-[1.4] text-grayscale-600"
        >
          {label}
        </label>
      )}
      <div
        className={cn(
          "flex w-full items-center gap-2.5 rounded-lg border border-solid bg-white px-3 py-2.5 transition-colors",
          error
            ? "border-system-error"
            : "border-grayscale-300 focus-within:border-primary-500",
        )}
      >
        <input
          id={inputId}
          type="date"
          aria-invalid={Boolean(error) || undefined}
          className="min-w-0 flex-1 bg-transparent text-base font-medium leading-[1.5] text-grayscale-800 outline-none [&::-webkit-datetime-edit-fields-wrapper]:text-grayscale-800"
          {...rest}
        />
      </div>
      {error && (
        <p className="w-full px-1 text-[13px] font-medium leading-[1.4] text-system-error">
          {error}
        </p>
      )}
    </div>
  );
}

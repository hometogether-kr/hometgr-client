"use client";

import type { ChangeEvent, InputHTMLAttributes, ReactNode } from "react";
import { useId, useState } from "react";

import { cn } from "@/shared/lib/cn";

export type TextFieldSize = "s" | "m" | "L";

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Figma: title — 상단 라벨 */
  label?: string;
  /** Figma: property 1 = error — 에러 문구. 있으면 error 스타일 적용 */
  error?: string;
  /** Figma: prop_value — "0/1000" 글자 수 카운터 표시. maxLength와 함께 사용 */
  showCount?: boolean;
  /** Figma: size (s · m · L). 너비는 예시 값이므로 className으로 지정 */
  size?: TextFieldSize;
  /**
   * 입력 박스 오른쪽에 붙는 액션 (계정 정보의 "수정완료" 버튼 등).
   * 에러 문구는 액션 아래가 아니라 박스 아래에 그대로 남습니다.
   */
  action?: ReactNode;
}

const boxSizeClasses: Record<TextFieldSize, string> = {
  s: "p-3",
  m: "h-[46px] items-center p-3",
  L: "p-3",
};

/**
 * 텍스트필드 (Figma: textfield, node 133:1346)
 *
 * - default: border grayscale-300 · placeholder grayscale-400
 * - editing: border primary-500 (CSS focus-within)
 * - completed: 입력값 grayscale-800
 * - error: border system-error + 하단 에러 문구
 * - disable: bg grayscale-100 · text grayscale-500 (disabled prop)
 */
export function TextField({
  label,
  error,
  showCount = false,
  size = "m",
  maxLength,
  value,
  defaultValue,
  onChange,
  disabled,
  action,
  className,
  id,
  ...rest
}: TextFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [innerLength, setInnerLength] = useState(String(defaultValue ?? "").length);
  const length = value != null ? String(value).length : innerLength;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInnerLength(e.target.value.length);
    onChange?.(e);
  };

  const boxClasses = cn(
    "flex w-full gap-2.5 rounded-lg border border-solid transition-colors",
    boxSizeClasses[size],
    disabled
      ? "border-grayscale-300 bg-grayscale-100"
      : error
        ? "border-system-error bg-white"
        : "border-grayscale-300 bg-white focus-within:border-primary-500",
  );

  return (
    <div className={cn("flex flex-col items-start gap-2", className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="w-full text-sm leading-[1.4] font-medium text-grayscale-600"
        >
          {label}
        </label>
      )}
      <div className="flex w-full items-center gap-2.5">
        <div className={boxClasses}>
          <input
            id={inputId}
            maxLength={maxLength}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            disabled={disabled}
            aria-invalid={Boolean(error) || undefined}
            className={cn(
              "min-w-0 flex-1 bg-transparent text-base leading-[1.5] font-medium outline-none",
              "placeholder:text-grayscale-400",
              disabled ? "text-grayscale-500" : "text-grayscale-800",
            )}
            {...rest}
          />
          {showCount && (
            <span className="shrink-0 self-center text-right text-[13px] leading-[1.4] font-normal whitespace-nowrap text-grayscale-500">
              {length}/{maxLength ?? 1000}
            </span>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {error && (
        <p className="w-full px-1 text-[13px] leading-[1.4] font-medium text-system-error">
          {error}
        </p>
      )}
    </div>
  );
}

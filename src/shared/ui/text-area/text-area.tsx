"use client";

import { useId, useState } from "react";
import type { ChangeEvent, TextareaHTMLAttributes } from "react";

export type TextAreaSize = "s" | "m" | "l";

export interface TextAreaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  /** Figma: title — 상단 라벨 */
  label?: string;
  /** Figma: property 1 = error — 에러 문구. 있으면 error 스타일 적용 */
  error?: string;
  /** Figma: prop_value — 하단 우측 "0/1000" 카운터. maxLength와 함께 사용 */
  showCount?: boolean;
  /** Figma: size (s · m · l) — 입력 박스 높이. 너비는 className으로 지정 */
  size?: TextAreaSize;
}

const boxHeightClasses: Record<TextAreaSize, string> = {
  s: "h-32",
  m: "h-[116px]",
  l: "h-[136px]",
};

/**
 * 멀티라인 텍스트필드 (Figma: textfield_multiline, node 403:7533)
 *
 * TextField(단일 라인)와 동일한 상태 체계:
 * default / editing(focus-within, primary-500) / completed /
 * error(system-error + 문구) / disable(bg grayscale-100)
 */
export function TextArea({
  label,
  error,
  showCount = false,
  size = "l",
  maxLength,
  value,
  defaultValue,
  onChange,
  disabled,
  className,
  id,
  ...rest
}: TextAreaProps) {
  const autoId = useId();
  const textareaId = id ?? autoId;
  const [innerLength, setInnerLength] = useState(
    String(defaultValue ?? "").length,
  );
  const length = value != null ? String(value).length : innerLength;

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInnerLength(e.target.value.length);
    onChange?.(e);
  };

  const boxClasses = [
    "flex w-full flex-col gap-2 rounded-lg border border-solid p-3 transition-colors",
    boxHeightClasses[size],
    disabled
      ? "border-grayscale-300 bg-grayscale-100"
      : error
        ? "border-system-error bg-white"
        : "border-grayscale-300 bg-white focus-within:border-primary-500",
  ].join(" ");

  return (
    <div className={["flex flex-col items-start gap-2", className].filter(Boolean).join(" ")}>
      {label && (
        <label
          htmlFor={textareaId}
          className="w-full text-sm font-medium leading-[1.4] text-grayscale-600"
        >
          {label}
        </label>
      )}
      <div className={boxClasses}>
        <textarea
          id={textareaId}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          disabled={disabled}
          aria-invalid={Boolean(error) || undefined}
          className={[
            "min-h-0 w-full flex-1 resize-none bg-transparent text-base font-medium leading-[1.5] outline-none",
            "placeholder:text-grayscale-400",
            disabled ? "text-grayscale-500" : "text-grayscale-800",
          ].join(" ")}
          {...rest}
        />
        {showCount && (
          <span className="w-full shrink-0 text-right text-[13px] font-normal leading-[1.4] text-grayscale-500">
            {length}/{maxLength ?? 1000}
          </span>
        )}
      </div>
      {error && (
        <p className="w-full px-1 text-[13px] font-medium leading-[1.4] text-system-error">
          {error}
        </p>
      )}
    </div>
  );
}

"use client";

import { Radio } from "../radio";
import { TextField } from "../text-field";

export interface OptionalAmountFieldProps {
  label: string;
  /** 라디오 그룹 이름 (필드마다 고유해야 함) */
  name: string;
  /** "없음" | "있음" — null이면 미선택 */
  mode: "none" | "custom" | null;
  onModeChange: (mode: "none" | "custom") => void;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  className?: string;
}

/**
 * 없음 / 있음(직접 입력) 선택 필드 (Figma: 보증금·관리비, node 841:15919)
 *
 * - 라디오 2개 + "있음" 선택 시 금액 입력 필드 확장
 */
export function OptionalAmountField({
  label,
  name,
  mode,
  onModeChange,
  value,
  onValueChange,
  placeholder = "입력해주세요",
  error,
  className,
}: OptionalAmountFieldProps) {
  return (
    <div className={["flex w-full flex-col gap-3", className].filter(Boolean).join(" ")}>
      <p className="w-full text-sm font-medium leading-[1.4] text-grayscale-600">{label}</p>
      <div className="flex flex-col gap-3">
        <label className="flex cursor-pointer items-center gap-3">
          <Radio
            size="24"
            name={name}
            value="none"
            checked={mode === "none"}
            onChange={() => onModeChange("none")}
          />
          <span className="text-base font-semibold leading-[1.4] text-grayscale-700">없음</span>
        </label>
        <label className="flex cursor-pointer items-center gap-3">
          <Radio
            size="24"
            name={name}
            value="custom"
            checked={mode === "custom"}
            onChange={() => onModeChange("custom")}
          />
          <span className="text-base font-semibold leading-[1.4] text-grayscale-700">
            있음(직접 입력하기)
          </span>
        </label>
        {mode === "custom" && (
          <TextField
            size="L"
            className="w-full"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
          />
        )}
      </div>
      {error && (
        <p className="w-full pl-1 text-[13px] font-medium leading-[1.4] text-system-error">
          {error}
        </p>
      )}
    </div>
  );
}

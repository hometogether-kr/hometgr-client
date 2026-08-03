"use client";

import { ChipNormal } from "../chip-normal";
import { cn } from "@/shared/lib/cn";

/** 표시 문구와 실제 값이 다를 수 있어 라벨과 값을 따로 받습니다. */
export interface ChipOption<TValue extends string> {
  value: TValue;
  label: string;
}

interface ChipFieldBaseProps<TValue extends string> {
  label: string;
  options: readonly ChipOption<TValue>[];
  /** 하단 에러 문구 */
  error?: string;
  className?: string;
}

interface SingleChipFieldProps<TValue extends string> extends ChipFieldBaseProps<TValue> {
  multiple?: false;
  value: TValue | null;
  onChange: (value: TValue) => void;
}

interface MultiChipFieldProps<TValue extends string> extends ChipFieldBaseProps<TValue> {
  multiple: true;
  value: readonly TValue[];
  onChange: (value: TValue[]) => void;
  /** 선택 시 다른 항목을 모두 해제하는 배타 옵션 (예: "없음") */
  exclusiveOption?: TValue;
}

export type ChipFieldProps<TValue extends string> =
  | SingleChipFieldProps<TValue>
  | MultiChipFieldProps<TValue>;

/**
 * 라벨 + 칩 선택 그룹 (Figma: textfield + chip_normal 조합)
 *
 * 등록 플로우 3·4·6단계에서 반복되는 패턴
 */
export function ChipField<TValue extends string>(props: ChipFieldProps<TValue>) {
  const { label, options, error, className } = props;

  const isSelected = (option: TValue) =>
    props.multiple ? props.value.includes(option) : props.value === option;

  const handleClick = (option: TValue) => {
    if (!props.multiple) {
      props.onChange(option);
      return;
    }

    const { value, onChange, exclusiveOption } = props;

    if (exclusiveOption && option === exclusiveOption) {
      onChange(value.includes(exclusiveOption) ? [] : [exclusiveOption]);
      return;
    }

    const next = exclusiveOption ? value.filter((item) => item !== exclusiveOption) : [...value];
    onChange(next.includes(option) ? next.filter((item) => item !== option) : [...next, option]);
  };

  return (
    <div className={cn("flex w-full flex-col", className)}>
      <div className="flex w-full flex-col gap-3">
        <p className="w-full text-sm font-medium leading-[1.4] text-grayscale-600">{label}</p>
        <div className="flex flex-wrap items-center gap-1.5">
          {options.map((option) => (
            <ChipNormal
              key={option.value}
              shape="round"
              size="m"
              selected={isSelected(option.value)}
              onClick={() => handleClick(option.value)}
            >
              {option.label}
            </ChipNormal>
          ))}
        </div>
      </div>
      {error && (
        <p className="w-full pl-1 pt-3 text-[13px] font-medium leading-[1.4] text-system-error">
          {error}
        </p>
      )}
    </div>
  );
}

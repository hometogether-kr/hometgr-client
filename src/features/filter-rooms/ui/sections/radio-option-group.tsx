"use client";

import type { SelectOption } from "@/domains/room";
import { Radio } from "@/shared/ui/radio";

interface RadioOptionGroupProps<T extends string> {
  /** 라디오 그룹 이름 (그룹마다 고유) */
  name: string;
  /** 섹션 제목 요소 id */
  ariaLabelledby: string;
  options: readonly SelectOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
}

/**
 * 단일 선택 라디오 그룹 (계약 기간·성별 공용)
 *
 * Radio 자체가 label을 렌더링하므로 텍스트 label은 형제로 연결합니다.
 */
export function RadioOptionGroup<T extends string>({
  name,
  ariaLabelledby,
  options,
  value,
  onChange,
}: RadioOptionGroupProps<T>) {
  return (
    <div role="radiogroup" aria-labelledby={ariaLabelledby} className="flex flex-col gap-4">
      {options.map((option) => (
        <div key={option.value} className="flex items-center gap-3">
          <Radio
            id={`${name}-${option.value}`}
            className="rounded-full has-focus-visible:outline-2 has-focus-visible:outline-primary-500"
            size="24"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          <label
            htmlFor={`${name}-${option.value}`}
            className="cursor-pointer text-body-2 font-medium text-grayscale-800"
          >
            {option.label}
          </label>
        </div>
      ))}
    </div>
  );
}

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
 * 단일 선택 라디오 그룹 (계약 기간·인원·성별 공용)
 *
 * `Radio`가 라벨 prop이 없어 코드베이스 관례대로 `<label>`로 감싸 텍스트를 클릭 가능하게
 * 합니다(`optional-amount-field.tsx`와 동일). 네이티브 name 그룹에 더해 컨테이너에
 * `role="radiogroup"` + `aria-labelledby`로 그룹 이름을 붙입니다.
 */
export function RadioOptionGroup<T extends string>({
  name,
  ariaLabelledby,
  options,
  value,
  onChange,
}: RadioOptionGroupProps<T>) {
  return (
    <div role="radiogroup" aria-labelledby={ariaLabelledby} className="flex flex-col gap-3">
      {options.map((option) => (
        <label key={option.value} className="flex cursor-pointer items-center gap-3">
          <Radio
            size="24"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          <span className="text-body-1 text-grayscale-800">{option.label}</span>
        </label>
      ))}
    </div>
  );
}
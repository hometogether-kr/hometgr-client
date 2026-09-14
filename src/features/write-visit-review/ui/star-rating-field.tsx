"use client";

import { cn } from "@/shared/lib/cn";
import { Icon } from "@/shared/ui/icons";

const RATINGS = [1, 2, 3, 4, 5];

export interface StarRatingFieldProps {
  /** input 연결용 접두어 (예: "host-rating") */
  name: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  error?: string;
}

/**
 * 별점 입력 1~5 (Figma 5.1.3 방문 후기 작성)
 *
 * 선택 별은 검정(grayscale-900), 미선택 별은 회색 외곽선. 각 별이 radiogroup 안의
 * radio라 Tab으로 순회하고 Enter/Space로 선택합니다.
 */
export function StarRatingField({ name, label, value, onChange, error }: StarRatingFieldProps) {
  const errorId = error ? `${name}-error` : undefined;

  return (
    <fieldset aria-describedby={errorId}>
      <legend className="text-title-3 font-semibold text-grayscale-900">{label}</legend>
      <div className="mt-5 flex gap-2" role="radiogroup" aria-label={label}>
        {RATINGS.map((rating) => {
          const filled = rating <= value;

          return (
            <button
              key={rating}
              type="button"
              role="radio"
              aria-checked={rating === value}
              aria-label={`${rating}점`}
              onClick={() => onChange(rating)}
              className={cn(
                "flex size-7 items-center justify-center rounded-md transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                filled ? "text-grayscale-900" : "text-grayscale-300 hover:text-grayscale-400",
              )}
            >
              <Icon name="star" size={28} filled={filled} />
            </button>
          );
        })}
      </div>
      {error && (
        <p id={errorId} className="mt-2 text-label-2 font-medium text-system-error">
          {error}
        </p>
      )}
    </fieldset>
  );
}

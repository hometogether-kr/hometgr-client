"use client";

import { cn } from "@/shared/lib/cn";

export interface CounterProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

function StepButton({
  sign,
  label,
  onClick,
  disabled,
}: {
  sign: "minus" | "plus";
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="flex size-8 shrink-0 items-center justify-center rounded-full border border-solid border-grayscale-400 transition-opacity hover:opacity-70 disabled:opacity-40"
    >
      <span className="relative block size-3" aria-hidden="true">
        <span className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2 bg-grayscale-700" />
        {sign === "plus" && (
          <span className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-grayscale-700" />
        )}
      </span>
    </button>
  );
}

/**
 * 수량 카운터 (Figma: Container + btn_ic, node 424:12999)
 *
 * - 32px 원형 스텝 버튼(border grayscale-400) + 18px semibold 값
 * - ic_plus / ic_minus는 단순 선분이라 CSS로 구현 (에셋 불필요)
 */
export function Counter({ label, value, onChange, min = 0, max = 99, className }: CounterProps) {
  return (
    <div className={cn("flex flex-col justify-center gap-3", className)}>
      {label && (
        <p className="whitespace-nowrap text-sm font-medium leading-[1.4] text-grayscale-600">
          {label}
        </p>
      )}
      <div className="flex items-center gap-3">
        <StepButton
          sign="minus"
          label={`${label ?? "수량"} 줄이기`}
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
        />
        <span className="flex w-8 justify-center whitespace-nowrap text-lg font-semibold leading-[1.4] tracking-[-0.18px] text-grayscale-700">
          {value}
        </span>
        <StepButton
          sign="plus"
          label={`${label ?? "수량"} 늘리기`}
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
        />
      </div>
    </div>
  );
}

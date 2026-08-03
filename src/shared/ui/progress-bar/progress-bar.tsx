import { cn } from "@/shared/lib/cn";

export interface ProgressBarProps {
  /** 현재 단계 (1부터) */
  value: number;
  /** 전체 단계 수 */
  max: number;
  className?: string;
}

/**
 * 진행 바 (Figma: progress bar, node 133:515)
 *
 * - 트랙 bg grayscale-100 · 채움 primary-500 · h-5 rounded-4
 */
export function ProgressBar({ value, max, className }: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn("h-[5px] w-full overflow-hidden rounded bg-grayscale-100", className)}
    >
      <div className="h-full rounded bg-primary-500 transition-[width]" style={{ width: `${percent}%` }} />
    </div>
  );
}

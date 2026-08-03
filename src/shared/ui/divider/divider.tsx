import { cn } from "@/shared/lib/cn";

export interface DividerProps {
  className?: string;
}

/**
 * 구분선 (Figma: Line, 1px · grayscale-200)
 *
 * 높이를 차지하지 않도록 border만 그립니다. 색을 바꿀 때는
 * className에 border-* 유틸리티를 넘기세요.
 */
export function Divider({ className }: DividerProps) {
  return (
    <hr
      className={cn("w-full border-0 border-t border-solid border-grayscale-200", className)}
    />
  );
}

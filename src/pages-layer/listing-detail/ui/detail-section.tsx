import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

export interface DetailSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

/**
 * 매물 상세 카드 섹션 공통 틀 (Figma: 가격 및 계약 조건 / 위치안내 / 상세 설명 등)
 *
 * border grayscale-200 · rounded-20 · 제목(24px SemiBold) + 본문 구성이 모든
 * 상세 카드에서 반복돼 한 곳에 모았습니다.
 */
export function DetailSection({ title, children, className }: DetailSectionProps) {
  return (
    <section
      className={cn(
        "flex w-full flex-col gap-6 rounded-2xl border border-grayscale-200 px-6 py-7 md:px-9 md:py-8",
        className,
      )}
    >
      <h2 className="text-title-3 font-semibold text-grayscale-900">{title}</h2>
      {children}
    </section>
  );
}

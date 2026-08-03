import type { ReactNode } from "react";

export interface AccountSectionProps {
  title: string;
  /** 제목 오른쪽 액션 (계정 전환 요청·수정하기 등) */
  action?: ReactNode;
  children: ReactNode;
}

/**
 * 계정 정보 화면의 흰색 카드 섹션 (Figma: 646:26535 · 646:26568)
 *
 * 데스크톱은 rounded-16 · px-64 py-48, 모바일은 좌우 여백을 줄입니다.
 */
export function AccountSection({ title, action, children }: AccountSectionProps) {
  return (
    <section className="flex w-full flex-col gap-6 rounded-2xl bg-white px-5 py-6 md:gap-8 md:px-16 md:py-12">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-heading-2 font-bold text-grayscale-900">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

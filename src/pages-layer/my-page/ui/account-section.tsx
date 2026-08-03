import type { ReactNode } from "react";

export interface AccountSectionProps {
  title: string;
  /** 제목 오른쪽 액션 (계정 전환 요청·수정하기 등) */
  action?: ReactNode;
  children: ReactNode;
}

/**
 * 계정 정보 화면의 섹션
 *
 * - 데스크톱(Figma 646:26535 · 646:26568): 흰색 카드 rounded-16 · px-64 py-48,
 *   제목과 액션이 같은 줄 양 끝
 * - 모바일(Figma 714:4444 · 702:14909): 카드 없이 본문에 바로 놓이고 섹션 사이는
 *   구분선으로 나뉩니다. 액션은 제목 아래 우측 정렬
 */
export function AccountSection({ title, action, children }: AccountSectionProps) {
  return (
    <section className="flex w-full flex-col gap-4 md:gap-8 md:rounded-2xl md:bg-white md:px-16 md:py-12">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-4">
        <h2 className="text-heading-1 font-semibold text-grayscale-900 md:text-heading-2 md:font-bold">
          {title}
        </h2>
        {action && <div className="flex justify-end md:block">{action}</div>}
      </div>
      {children}
    </section>
  );
}

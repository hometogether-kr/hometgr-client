import type { ReactNode } from "react";
import { ResponsiveHeader } from "@/widgets/responsive-header";

export type OnboardingCardWidth = "narrow" | "wide";
export type OnboardingTitlePlacement = "in-card" | "above-card";
export type OnboardingFooterPlacement = "both" | "mobile";

export interface OnboardingLayoutProps {
  title: string;
  /** 제목 아래 보조 설명 */
  description?: string;
  children: ReactNode;
  /** 하단 액션 영역 */
  footer?: ReactNode;
  /** 모바일 GNB 뒤로가기 */
  onBack?: () => void;
  /**
   * 데스크톱 카드 폭.
   * narrow(560px)는 약관 동의처럼 단일 컬럼, wide(1080px)는 회원 유형 선택처럼
   * 좌우 2단 구성에 사용합니다.
   */
  cardWidth?: OnboardingCardWidth;
  /**
   * 데스크톱에서 제목을 카드 안(약관 동의)에 둘지 카드 위(회원 유형 선택)에 둘지.
   * 모바일은 항상 카드 위입니다.
   */
  titlePlacement?: OnboardingTitlePlacement;
  /**
   * footer를 어디에 그릴지.
   * both는 데스크톱 카드 하단과 모바일 고정 영역 모두, mobile은 모바일에만
   * 그립니다(데스크톱 CTA가 본문 안에 따로 있는 경우).
   */
  footerPlacement?: OnboardingFooterPlacement;
}

const cardWidthClasses: Record<OnboardingCardWidth, string> = {
  narrow: "md:w-[560px]",
  wide: "md:w-[1080px]",
};

/** Figma: 약관 동의 카드는 radius 8, 회원 유형 선택 카드는 radius 16 */
const cardRadiusClasses: Record<OnboardingCardWidth, string> = {
  narrow: "md:rounded-lg",
  wide: "md:rounded-2xl",
};

/**
 * 로그인 이후 온보딩 공통 레이아웃 (약관 동의 · 회원 유형 선택)
 *
 * - 데스크톱(md~, Figma 643:19267 · 643:19159): Navigation + 화면 중앙 흰색 카드
 * - 모바일(~md, Figma 749:17279 · 693:14014): GnbMobile(back) + 좌측 정렬 제목 +
 *   본문, 하단에 고정된 CTA
 */
export function OnboardingLayout({
  title,
  description,
  children,
  footer,
  onBack,
  cardWidth = "narrow",
  titlePlacement = "in-card",
  footerPlacement = "both",
}: OnboardingLayoutProps) {
  const header = (
    <header className="flex flex-col gap-1">
      <h1
        className={[
          "text-heading-1 font-semibold text-grayscale-900",
          titlePlacement === "in-card"
            ? "md:text-title-3 md:text-grayscale-800"
            : "md:text-display-3 md:text-grayscale-800",
        ].join(" ")}
      >
        {title}
      </h1>
      {description && (
        <p className="text-label-1 font-medium leading-[1.5] text-grayscale-600 md:text-body-1 md:text-grayscale-700">
          {description}
        </p>
      )}
    </header>
  );

  return (
    <div className="flex min-h-screen flex-col bg-grayscale-50">
      <ResponsiveHeader mobile={{ variant: "back", onBack }} />

      <main className="flex flex-1 flex-col px-5 pb-[104px] pt-2 md:items-center md:justify-center md:px-5 md:py-16">
        <div
          className={["flex w-full flex-col gap-8 md:gap-12", cardWidthClasses[cardWidth]].join(" ")}
        >
          {titlePlacement === "above-card" && header}

          <section
            className={[
              "flex flex-col gap-8 md:gap-10 md:bg-white md:px-16 md:py-12",
              cardRadiusClasses[cardWidth],
            ].join(" ")}
          >
            {titlePlacement === "in-card" && header}
            {children}
            {footer && footerPlacement === "both" && <div className="hidden md:block">{footer}</div>}
          </section>
        </div>
      </main>

      {footer && (
        <div className="fixed inset-x-0 bottom-0 z-40 bg-grayscale-50 px-5 pb-6 pt-2 md:hidden">
          {footer}
        </div>
      )}
    </div>
  );
}

import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";
import { Footer } from "@/widgets/footer";
import { ResponsiveHeader } from "@/widgets/responsive-header";

export interface SiteLayoutProps {
  children: ReactNode;
  /**
   * 하단 푸터 노출 여부 (기본 true)
   *
   * 이 레이아웃은 홈·로그인·매물 목록처럼 자유롭게 둘러보는 화면용이라 푸터가
   * 기본입니다. 하단 고정 CTA를 쓰는 온보딩·등록 단계는 각각 OnboardingLayout,
   * ListingStepLayout을 사용하므로 여기 해당하지 않습니다.
   */
  showFooter?: boolean;
  /** 본문 배경. 기본은 회색(grayscale-50) */
  background?: "gray" | "white";
}

/**
 * 서비스 공통 페이지 레이아웃
 *
 * 로고형 헤더(데스크톱 Navigation · 모바일 gnb_mobile logo)와 본문, 푸터로
 * 구성됩니다. 온보딩처럼 뒤로가기 헤더가 필요한 화면은 OnboardingLayout을 쓰세요.
 */
export function SiteLayout({ children, showFooter = true, background = "gray" }: SiteLayoutProps) {
  return (
    <div
      className={cn(
        "flex min-h-screen flex-col",
        background === "gray" ? "bg-grayscale-50" : "bg-white",
      )}
    >
      <ResponsiveHeader mobile={{ variant: "logo" }} />
      <main className="flex flex-1 flex-col">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}

import { GnbMobile } from "@/widgets/gnb-mobile";
import type { GnbMobileProps } from "@/widgets/gnb-mobile";
import { Navigation } from "@/widgets/navigation";

export interface ResponsiveHeaderProps {
  /** 모바일(~md)에서 렌더링할 GNB 설정 */
  mobile: GnbMobileProps;
}

/**
 * 브레이크포인트별 헤더 전환
 *
 * Figma가 데스크톱은 Navigation(52px 상단 바), 모바일은 gnb_mobile로 나눠 두어
 * 두 컴포넌트를 CSS로 교체합니다. 모든 페이지 레이아웃이 같은 전환 규칙을 쓰도록
 * 여기 한 곳에 모았습니다.
 *
 * Navigation은 로그인 여부와 활성 메뉴를 세션·경로에서 직접 읽으므로 전달할 설정이
 * 없습니다.
 */
export function ResponsiveHeader({ mobile }: ResponsiveHeaderProps) {
  return (
    <>
      <div className="md:hidden">
        <GnbMobile {...mobile} />
      </div>
      <div className="hidden md:block">
        <Navigation />
      </div>
    </>
  );
}

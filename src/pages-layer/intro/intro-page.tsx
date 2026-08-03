import { SiteLayout } from "@/widgets/site-layout";

import {
  AUDIENCE_LABEL,
  type IntroAudience,
  type IntroSlide,
  MOBILE_SLIDE,
  toDesktopSlides,
} from "./intro-slides";

interface IntroPageProps {
  audience: IntroAudience;
}

/**
 * 소개 이미지 한 장
 *
 * SVG는 next/image가 dangerouslyAllowSVG 없이 막기 때문에 img로 렌더링합니다.
 * width·height를 원본 비율로 넘겨 로드 전에도 높이를 확보합니다.
 */
function IntroSlideImage({ slide, priority }: { slide: IntroSlide; priority: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- next/image는 dangerouslyAllowSVG 없이 SVG를 막습니다
    <img
      src={slide.src}
      alt=""
      width={slide.width}
      height={slide.height}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      className="block h-auto w-full"
    />
  );
}

/**
 * 서비스 소개 상세 (Host · Guest)
 *
 * 데스크톱은 service-info → partner → 대상별 1~6 순서로 전체 폭 이미지를
 * 이어붙이고, 모바일은 대상 구분 없이 mobile-info 한 장만 보여줍니다.
 */
export function IntroPage({ audience }: IntroPageProps) {
  const desktopSlides = toDesktopSlides(audience);

  return (
    <SiteLayout background="white">
      <h1 className="sr-only">{AUDIENCE_LABEL[audience]}를 위한 서비스 소개</h1>

      <div className="w-full md:hidden">
        <IntroSlideImage slide={MOBILE_SLIDE} priority />
      </div>

      <div className="hidden w-full md:block">
        {desktopSlides.map((slide, index) => (
          <IntroSlideImage key={slide.src} slide={slide} priority={index === 0} />
        ))}
      </div>
    </SiteLayout>
  );
}

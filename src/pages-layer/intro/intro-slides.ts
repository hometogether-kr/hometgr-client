export type IntroAudience = "host" | "guest";

export interface IntroSlide {
  src: string;
  /** 원본 SVG 크기. 로드 전에도 자리를 잡아 레이아웃 이동을 막습니다. */
  width: number;
  height: number;
}

const LANDING_DIR = "/images/landing";

/** Host·Guest가 공유하는 도입부 (서비스 소개 → 제휴사) */
const SHARED_SLIDES: IntroSlide[] = [
  { src: `${LANDING_DIR}/service-info.svg`, width: 1920, height: 514 },
  { src: `${LANDING_DIR}/partner.svg`, width: 1920, height: 1024 },
];

const HOST_SLIDES: IntroSlide[] = [
  { src: `${LANDING_DIR}/host-1.svg`, width: 1920, height: 1200 },
  { src: `${LANDING_DIR}/host-2.svg`, width: 1920, height: 1500 },
  { src: `${LANDING_DIR}/host-3.svg`, width: 1920, height: 1200 },
  { src: `${LANDING_DIR}/host-4.svg`, width: 1920, height: 1024 },
  { src: `${LANDING_DIR}/host-5.svg`, width: 1920, height: 1200 },
  { src: `${LANDING_DIR}/host-6.svg`, width: 1920, height: 327 },
];

const GUEST_SLIDES: IntroSlide[] = [
  { src: `${LANDING_DIR}/guest-1.svg`, width: 1920, height: 1024 },
  { src: `${LANDING_DIR}/guest-2.svg`, width: 1920, height: 1500 },
  { src: `${LANDING_DIR}/guest-3.svg`, width: 1920, height: 1200 },
  { src: `${LANDING_DIR}/guest-4.svg`, width: 1920, height: 436 },
  { src: `${LANDING_DIR}/guest-5.svg`, width: 1920, height: 1024 },
  { src: `${LANDING_DIR}/guest-6.svg`, width: 1920, height: 1200 },
];

/** 모바일은 Host·Guest 구분 없이 한 장짜리 소개 이미지를 씁니다. */
export const MOBILE_SLIDE: IntroSlide = {
  src: `${LANDING_DIR}/mobile-info.svg`,
  width: 750,
  height: 4040,
};

export const AUDIENCE_LABEL: Record<IntroAudience, string> = {
  host: "집주인",
  guest: "세입자",
};

export function toDesktopSlides(audience: IntroAudience): IntroSlide[] {
  return [...SHARED_SLIDES, ...(audience === "host" ? HOST_SLIDES : GUEST_SLIDES)];
}

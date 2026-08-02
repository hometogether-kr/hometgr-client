/** 푸터용 회색 로고 (176×32) */
const DARK_LOGO = "/images/dark-logo.svg";
const IC_INSTAGRAM = "/icons/ic-insta.svg";
const IC_KAKAO = "/icons/ic-kakao.svg";

/* eslint-disable @next/next/no-img-element -- 임시 Figma 에셋, 커밋된 SVG로 교체 예정 */

function FooterLogo() {
  return (
    <img
      alt="Home Together"
      src={DARK_LOGO}
      className="block h-7 w-[154px] max-w-none md:h-8 md:w-[176px]"
    />
  );
}

function FooterContact() {
  return (
    <div className="text-sm font-normal leading-[1.5] text-grayscale-600 md:text-[15px] md:leading-[1.6]">
      <p>
        E-mail : <a href="mailto:hometo.kr@gmail.com">hometo.kr@gmail.com</a>
      </p>
      <p>Tel : 010.4587.9428</p>
      <p>Instagram: @home.tgr</p>
    </div>
  );
}

function FooterSocial() {
  return (
    <div className="flex items-center gap-[9px]">
      <a
        href="https://www.instagram.com/home.tgr"
        target="_blank"
        rel="noreferrer"
        aria-label="Instagram"
        className="rounded-full w-13.5 h-13.5 bg-grayscale-500 items-center justify-center flex"
      >
        <img alt="" src={IC_INSTAGRAM} className="block size-7 max-w-none" />
      </a>
      {/* TODO: 채팅 채널 링크가 정해지면 href를 교체하세요. */}
      <a
        href="#"
        aria-label="채팅 문의"
        className="rounded-full w-13.5 h-13.5 bg-grayscale-500 items-center justify-center flex"
      >
        <img alt="" src={IC_KAKAO} className="block size-7 max-w-none" />
      </a>
    </div>
  );
}

function FooterCopyright() {
  return (
    <p className="whitespace-nowrap text-sm font-normal leading-[1.5] text-grayscale-600">
      © 2026 Home Together. All rights reserved.
    </p>
  );
}

/**
 * 푸터 (Figma: Footer 153:929 · Footer_mobile 541:20757)
 *
 * - bg grayscale-70, 데스크톱 px-200 py-24 / 모바일 px-16 py-24
 * - md 미만: 세로 스택(로고→연락처→저작권→소셜 중앙)
 * - md 이상: 좌(로고+연락처) · 우(소셜+저작권) 양끝 정렬, 높이 152px
 */
export function Footer({ className }: { className?: string }) {
  return (
    <footer
      className={["w-full bg-grayscale-70 px-4 py-6 md:px-[200px]", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="hidden h-[152px] w-full items-start justify-between md:flex">
        <div className="flex h-full w-[260px] flex-col items-start justify-between">
          <FooterLogo />
          <FooterContact />
        </div>
        <div className="flex h-full flex-col items-end justify-between">
          <FooterSocial />
          <FooterCopyright />
        </div>
      </div>
      <div className="flex flex-col gap-7 md:hidden">
        <div className="flex flex-col items-start gap-5 px-2">
          <FooterLogo />
          <FooterContact />
          <FooterCopyright />
        </div>
        <div className="flex w-full justify-center">
          <FooterSocial />
        </div>
      </div>
    </footer>
  );
}

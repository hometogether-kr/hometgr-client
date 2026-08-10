import { cn } from "@/shared/lib/cn";

const DARK_LOGO_L = "/images/logos/logo-dark-l.svg";
const DARK_LOGO_M = "/images/logos/logo-dark-m.svg";
const IC_INSTAGRAM = "/icons/ic-insta.svg";
const IC_KAKAO = "/icons/ic-kakao.svg";

/* eslint-disable @next/next/no-img-element -- SVG 에셋을 원본 그대로 렌더링합니다 */

function FooterLogo({ size }: { size: "l" | "m" }) {
  const logo =
    size === "l"
      ? { src: DARK_LOGO_L, width: 176, height: 32, className: "h-8 w-[176px]" }
      : { src: DARK_LOGO_M, width: 155, height: 28, className: "h-7 w-[155px]" };

  return (
    <img
      alt="Home Together"
      src={logo.src}
      width={logo.width}
      height={logo.height}
      className={cn("block max-w-none", logo.className)}
    />
  );
}

function FooterContact() {
  return (
    <div className="text-sm leading-[1.5] font-normal text-grayscale-600 md:text-[15px] md:leading-[1.6]">
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
        className="flex h-13.5 w-13.5 items-center justify-center rounded-full bg-grayscale-500"
      >
        <img alt="" src={IC_INSTAGRAM} className="block size-7 max-w-none" />
      </a>
      {/* TODO: 채팅 채널 링크가 정해지면 href를 교체하세요. */}
      <a
        href="#"
        aria-label="채팅 문의"
        className="flex h-13.5 w-13.5 items-center justify-center rounded-full bg-grayscale-500"
      >
        <img alt="" src={IC_KAKAO} className="block size-7 max-w-none" />
      </a>
    </div>
  );
}

function FooterCopyright() {
  return (
    <p className="text-sm leading-[1.5] font-normal whitespace-nowrap text-grayscale-600">
      © 2026 Home Together. All rights reserved.
    </p>
  );
}

function FooterBusinessInfo(){
  return (
    <div className = "mt-5 border-t border-grayscale-300 pt-4 text-sm leading-[1.6] font-normal text-grayscale-600 md:mt-6">
      주식회사 핀타 · 사업자등록번호 481-87-04211 · 인천광역시 연수구 갯벌로 12,
      511호(송도동, 미추홀타워 별관A동)
    </div>
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
    <footer className={cn("w-full bg-grayscale-70 px-4 py-6 md:px-[200px]", className)}>
      <div className="hidden h-[152px] w-full items-start justify-between md:flex">
        <div className="flex h-full w-[260px] flex-col items-start justify-between">
          <FooterLogo size="l" />
          <FooterContact />
        </div>
        <div className="flex h-full flex-col items-end justify-between">
          <FooterSocial />
          <FooterCopyright />
        </div>
      </div>
      <div className="flex flex-col gap-7 md:hidden">
        <div className="flex flex-col items-start gap-5 px-2">
          <FooterLogo size="m" />
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

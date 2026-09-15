import { cn } from "@/shared/lib/cn";

import { FooterPolicyLinks } from "./footer-policy-links";

const SOCIAL_LINKS = [
  {
    label: "홈투게더 네이버 블로그",
    href: "https://blog.naver.com/home_together_",
    icon: "/icons/ic-blog.svg",
  },
  {
    label: "홈투게더 인스타그램",
    href: "https://www.instagram.com/home.tgr/",
    icon: "/icons/ic-insta.svg",
  },
  {
    label: "홈투게더 유튜브",
    href: "https://www.youtube.com/channel/UCQSrpG0h3wmvGLgrBC8SFpw",
    icon: "/icons/ic-youtube.svg",
  },
];

/* eslint-disable @next/next/no-img-element -- SVG 에셋을 원본 그대로 렌더링합니다 */

function FooterCustomerService() {
  return (
    <section className="text-sm leading-[1.7] text-grayscale-600">
      <h2 className="mb-3 text-base font-semibold text-grayscale-900">고객센터</h2>
      <p>운영시간: 평일 10:00~18:00</p>
      <p>
        전화:{" "}
        <a
          href="tel:01045879428"
          className="rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500"
        >
          010-4587-9428
        </a>
      </p>
      <p>
        이메일:{" "}
        <a
          href="mailto:contact@hometogether.kr"
          className="rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500"
        >
          contact@hometogether.kr
        </a>
      </p>
      <p className="mt-3 break-keep">
        운영시간 외 및 주말·공휴일에는 카카오톡 문의하기 채널을 이용해 주세요.
      </p>
      <a
        href="https://pf.kakao.com/_BKlhX/chat"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-grayscale-300 bg-white px-4 py-2 text-sm font-medium text-grayscale-800 transition-colors hover:bg-grayscale-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500"
      >
        <img
          src="/icons/ic-kakao.svg"
          alt=""
          width={20}
          height={20}
          className="size-5 brightness-0"
        />
        카카오톡 문의하기
      </a>
    </section>
  );
}

function FooterBusinessInfo() {
  return (
    <section className="text-sm leading-[1.7] text-grayscale-600">
      <h2 className="mb-3 text-base font-semibold text-grayscale-900">사업자정보</h2>
      <p className="font-medium text-grayscale-800">주식회사 핀타 · 홈투게더</p>
      <p className="mt-1">사업자등록번호: 481-87-04211</p>
      <p className="mt-1 break-keep">
        주소: 인천광역시 연수구 갯벌로 12, 511호(송도동, 미추홀타워 별관A동)
      </p>
      <FooterPolicyLinks />
    </section>
  );
}

function FooterSocial() {
  return (
    <nav aria-label="홈투게더 소셜 미디어" className="flex items-center gap-3">
      {SOCIAL_LINKS.map(({ label, href, icon }) => (
        <a
          key={href}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${label} (새 탭)`}
          title={label}
          className="flex size-11 items-center justify-center rounded-full bg-grayscale-600 transition-colors hover:bg-grayscale-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500"
        >
          <img alt="" src={icon} width={24} height={24} className="block size-6" />
        </a>
      ))}
    </nav>
  );
}

export function Footer({ className }: { className?: string }) {
  return (
    <footer
      className={cn("w-full bg-grayscale-70 px-4 py-8 md:px-8 md:py-10 xl:px-[200px]", className)}
    >
      <div className="mx-auto w-full max-w-[1520px]">
        <img
          alt="Home Together"
          src="/images/logos/logo-dark-l.svg"
          width={176}
          height={32}
          className="block h-7 w-auto md:h-8"
        />
        <div className="mt-7 grid gap-8 md:grid-cols-[minmax(0,1fr)_320px] md:gap-12">
          <div className="md:order-2">
            <FooterCustomerService />
          </div>
          <FooterBusinessInfo />
        </div>
        <div className="mt-8 flex flex-col gap-5 border-t border-grayscale-300 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <FooterSocial />
          <p className="text-xs leading-relaxed text-grayscale-600 sm:text-sm">
            © 2026 Home Together. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

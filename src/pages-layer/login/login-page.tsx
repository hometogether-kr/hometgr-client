"use client";

import { BtnCta } from "@/shared/ui/btn-cta";
import { SiteLayout } from "@/widgets/site-layout";

/**
 * TODO: 아래 에셋은 7일 후 만료되는 Figma 임시 URL입니다.
 * 히어로 이미지와 모바일 로고 일러스트를 export해 public/에 커밋한 뒤
 * next/image로 교체하세요.
 */
const FIGMA_TEMP_HERO =
  "/figma/hero-32b08abb.png";
const FIGMA_TEMP_LOGO_ILLUST =
  "/figma/logo-illust-da269702.svg";

/* eslint-disable @next/next/no-img-element -- 임시 Figma 에셋, 커밋된 이미지로 교체 예정 */

export interface LoginPageProps {
  onKakaoLogin?: () => void;
  onExplore?: () => void;
}

/**
 * 로그인 / 회원가입
 *
 * - 데스크톱(Figma 643:19317): 화면 중앙에 문구 + 알약 버튼 2개(좌), 사진(우)
 * - 모바일(Figma 693:1862): 로고 일러스트와 문구를 가운데 정렬하고
 *   화면 하단에 버튼 2개를 세로로 배치
 */
export function LoginPage({ onKakaoLogin, onExplore }: LoginPageProps) {
  return (
    <SiteLayout>
      <div className="flex flex-1 flex-col px-5 pb-8 md:justify-center md:px-5 md:py-16">
        <div className="my-auto flex flex-col items-center gap-16 md:my-0 md:flex-row md:items-center md:justify-center md:gap-40">
          <div className="flex flex-col items-center gap-6 md:items-start md:gap-40">
            <div className="flex flex-col items-center gap-2 md:items-start md:gap-6">
              <img
                alt=""
                src={FIGMA_TEMP_LOGO_ILLUST}
                className="mb-6 block h-[47px] w-[86px] max-w-none md:hidden"
              />
              <h1 className="text-center text-heading-2 font-semibold text-grayscale-900 md:text-left md:text-display-1 md:font-bold">
                누군가에겐 남는 방,
                <br />
                누군가에겐 꼭 필요한 집.
              </h1>
              <p className="text-center text-caption-2 font-medium text-grayscale-600 md:text-left md:text-headline-1 md:font-normal">
                홈투게더는 카카오 계정으로
                <br className="md:hidden" />
                <span className="hidden md:inline"> </span>
                간편하게 시작할 수 있어요.
              </p>
            </div>

            {/* 데스크톱 버튼 — 모바일은 화면 하단에 따로 배치 */}
            <div className="hidden items-center gap-3 md:flex">
              <BtnCta size="pill" variant="kakao" className="min-w-[200px]" onClick={onKakaoLogin}>
                카카오로 시작하기
              </BtnCta>
              {/* Figma 643:19334는 공통 stroke보다 연한 테두리에 흰 배경입니다. */}
              <BtnCta
                size="pill"
                variant="stroke"
                className="min-w-[160px] border-grayscale-200 bg-white text-grayscale-900"
                onClick={onExplore}
              >
                서비스 둘러보기
              </BtnCta>
            </div>
          </div>

          <img
            alt=""
            src={FIGMA_TEMP_HERO}
            className="hidden h-[415px] w-[340px] max-w-none rounded-lg border border-grayscale-200 object-cover md:block"
          />
        </div>

        {/* 모바일 버튼 */}
        <div className="flex shrink-0 flex-col gap-2.5 md:hidden">
          {/* Figma 693:13683은 배경이 페이지와 같은 grayscale-50입니다. */}
          <BtnCta
            size="mobile"
            variant="stroke"
            className="w-full bg-grayscale-50 text-grayscale-900"
            onClick={onExplore}
          >
            서비스 둘러보기
          </BtnCta>
          <BtnCta size="mobile" variant="kakao" className="w-full" onClick={onKakaoLogin}>
            카카오로 시작하기
          </BtnCta>
        </div>
      </div>
    </SiteLayout>
  );
}

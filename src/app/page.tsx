import Link from "next/link";

import { ROUTES } from "@/shared/config";
import { SiteLayout } from "@/widgets/site-layout";

/**
 * 홈 (임시)
 *
 * Figma 랜딩 화면은 아직 옮기지 않았습니다. 지금은 공통 레이아웃이 동작하는지
 * 확인하고 주요 진입점으로 이동할 수 있는 최소 화면만 둡니다.
 */
export default function Home() {
  return (
    <SiteLayout>
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-5 py-24 text-center">
        <h1 className="text-heading-1 font-semibold text-grayscale-900 md:text-display-3">
          누군가에겐 남는 방,
          <br />
          누군가에겐 꼭 필요한 집
        </h1>
        <p className="text-label-1 font-medium text-grayscale-600 md:text-headline-1 md:font-normal">
          홈투게더는 카카오 계정으로 간편하게 시작할 수 있어요.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href={ROUTES.auth.login}
            className="inline-flex h-12 items-center justify-center rounded-xl bg-primary-500 px-6 text-body-1 font-semibold text-white transition-opacity hover:opacity-80"
          >
            로그인 / 회원가입
          </Link>
          <Link
            href={ROUTES.listing.start}
            className="inline-flex h-12 items-center justify-center rounded-xl border border-grayscale-300 px-6 text-body-1 font-semibold text-grayscale-600 transition-opacity hover:opacity-80"
          >
            방 내놓기
          </Link>
        </div>
      </div>
    </SiteLayout>
  );
}

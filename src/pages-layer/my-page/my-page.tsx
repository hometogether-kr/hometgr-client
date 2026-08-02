"use client";

import Link from "next/link";
import { useSession } from "@/domains/user";
import { ROUTES } from "@/shared/config";
import { BtnCta } from "@/shared/ui/btn-cta";
import { SiteLayout } from "@/widgets/site-layout";

/**
 * 마이페이지 (임시)
 *
 * TODO: Figma 마이페이지 화면이 나오면 프로필·예약·관심목록 섹션으로 교체하세요.
 * 지금은 헤더 프로필에서 넘어온 사용자가 로그인 상태와 진입점을 확인할 수 있는
 * 최소 화면만 둡니다.
 */
export function MyPage() {
  const { session, isLoading, isAuthenticated } = useSession();

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="flex flex-1 items-center justify-center px-5 py-24">
          <p className="text-body-1 font-medium text-grayscale-600">불러오는 중...</p>
        </div>
      </SiteLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <SiteLayout>
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-5 py-24 text-center">
          <h1 className="text-heading-2 font-semibold text-grayscale-900">로그인이 필요해요</h1>
          <p className="text-body-1 font-medium text-grayscale-600">
            마이페이지는 로그인 후 이용할 수 있어요.
          </p>
          <Link href={ROUTES.auth.login}>
            <BtnCta size="m">로그인하러 가기</BtnCta>
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const { user } = session;

  return (
    <SiteLayout>
      <div className="mx-auto flex w-full max-w-[886px] flex-1 flex-col gap-8 px-5 py-12 md:py-20">
        <header className="flex flex-col gap-2">
          <h1 className="text-heading-1 font-semibold text-grayscale-900">
            {user?.name ? `${user.name}님` : "마이페이지"}
          </h1>
          <p className="text-body-1 font-medium text-grayscale-600">
            {user?.memberRole === "host" ? "호스트 회원" : "입주자 회원"}
          </p>
        </header>

        <dl className="flex flex-col gap-4 rounded-2xl border border-grayscale-200 bg-white p-6">
          <div className="flex justify-between gap-4">
            <dt className="text-label-1 font-medium text-grayscale-600">이메일</dt>
            <dd className="text-label-1 font-medium text-grayscale-900">{user?.email ?? "-"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-label-1 font-medium text-grayscale-600">연락처</dt>
            <dd className="text-label-1 font-medium text-grayscale-900">{user?.phone ?? "-"}</dd>
          </div>
        </dl>
      </div>
    </SiteLayout>
  );
}

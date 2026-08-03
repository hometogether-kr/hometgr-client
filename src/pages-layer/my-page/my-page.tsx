"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { useSession } from "@/domains/user";
import { ROUTES } from "@/shared/config";
import { BtnCta } from "@/shared/ui/btn-cta";
import { BtnUnderline } from "@/shared/ui/btn-underline";
import { useToast } from "@/shared/ui/toast";
import { SiteLayout } from "@/widgets/site-layout";

import { GuardianSection } from "./ui/guardian-section";
import { ProfileSection } from "./ui/profile-section";
import { SettlementSection } from "./ui/settlement-section";

/** Figma 646:26524 · 646:27147의 저장 완료 토스트 */
const SAVE_SUCCESS_MESSAGE = "수정이 성공적으로 완료되었습니다.";

function MyPageShell({ children }: { children: ReactNode }) {
  return (
    <SiteLayout>
      <div className="mx-auto flex w-full max-w-[850px] flex-1 flex-col gap-8 px-5 py-10 md:gap-16 md:py-20">
        {children}
      </div>
    </SiteLayout>
  );
}

/**
 * 계정 정보 (Figma: 집주인 646:26524·643:20242 · 입주자 646:27147·646:26187)
 *
 * 상단 기본 정보 카드는 두 회원 유형이 공통이고, 아래 카드만 집주인은 정산 정보,
 * 입주자는 보호자 정보로 갈립니다.
 */
export function MyPage() {
  const { session, isLoading, isAuthenticated } = useSession();
  const { showToast } = useToast();

  if (isLoading) {
    return (
      <MyPageShell>
        <p className="py-24 text-center text-body-1 font-medium text-grayscale-600">
          불러오는 중...
        </p>
      </MyPageShell>
    );
  }

  if (!isAuthenticated || !session.user) {
    return (
      <MyPageShell>
        <div className="flex flex-1 flex-col items-center justify-center gap-6 py-24 text-center">
          <h1 className="text-heading-2 font-semibold text-grayscale-900">로그인이 필요해요</h1>
          <p className="text-body-1 font-medium text-grayscale-600">
            계정 정보는 로그인 후 이용할 수 있어요.
          </p>
          <Link href={ROUTES.auth.login}>
            <BtnCta size="m">로그인하러 가기</BtnCta>
          </Link>
        </div>
      </MyPageShell>
    );
  }

  const { user } = session;
  /* 관리자 계정은 memberRole이 없어 입주자 화면을 기본으로 보여줍니다. */
  const memberRole = user.memberRole ?? "guest";

  /*
   * TODO: 프로필·보호자 정보 수정 API가 아직 없습니다. 엔드포인트가 생기면
   * features 레이어의 뮤테이션 훅으로 옮기고 성공 시 세션 캐시를 무효화하세요.
   */
  const notifySaved = () => showToast(SAVE_SUCCESS_MESSAGE, { variant: "success" });

  return (
    <MyPageShell>
      <h1 className="text-heading-1 font-semibold text-grayscale-900 md:text-title-2">계정 정보</h1>

      <div className="flex flex-col gap-7">
        <ProfileSection user={user} memberRole={memberRole} onSaveIntroduction={notifySaved} />

        {memberRole === "host" ? (
          <SettlementSection />
        ) : (
          <GuardianSection onSavePhone={notifySaved} />
        )}
      </div>

      <div className="flex justify-center">
        <BtnUnderline tone="muted">회원 탈퇴</BtnUnderline>
      </div>
    </MyPageShell>
  );
}

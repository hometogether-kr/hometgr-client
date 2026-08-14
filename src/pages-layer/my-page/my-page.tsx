"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";

import { useSession } from "@/domains/user";
import { useAccountSessionActions, useLogoutFlow } from "@/features/manage-account-session";
import { ApiError } from "@/shared/api";
import { ROUTES } from "@/shared/config";
import { BtnCta } from "@/shared/ui/btn-cta";
import { BtnUnderline } from "@/shared/ui/btn-underline";
import { Divider } from "@/shared/ui/divider";
import { Modal } from "@/shared/ui/modal";
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
      {/* 모바일은 흰 배경 위에 바로 얹히고(Figma 714:4444), 데스크톱만 회색 배경에 카드가 뜹니다. */}
      <div className="mx-auto flex w-full max-w-[850px] flex-1 flex-col gap-6 bg-white px-5 py-6 md:gap-16 md:bg-transparent md:py-20">
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
  const router = useRouter();
  const { session, isLoading, isAuthenticated } = useSession();
  const { logout, isLoggingOut } = useLogoutFlow();
  const { deleteAccount, isDeletingAccount } = useAccountSessionActions();
  const { showToast } = useToast();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const redirectToLogin = () => {
    router.replace(ROUTES.auth.login);
    router.refresh();
  };

  const handleDeleteConfirmClose = () => {
    if (!isDeletingAccount) setDeleteConfirmOpen(false);
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      setDeleteConfirmOpen(false);
      redirectToLogin();
    } catch (error) {
      if (error instanceof ApiError && error.isUnauthorized) {
        redirectToLogin();
        return;
      }

      showToast(error instanceof ApiError ? error.message : "회원 탈퇴를 처리하지 못했습니다.", {
        variant: "error",
      });
    }
  };

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
      {/*
       * Figma 모바일은 이 제목을 GNB 타이틀로 처리하지만, 이 화면은 헤더 프로필에서
       * 들어오는 흐름이라 로고 GNB를 유지하기로 해서 본문에 제목을 남깁니다.
       */}
      <h1 className="text-headline-1 font-semibold text-grayscale-900 md:text-title-2">
        계정 정보
      </h1>

      <div className="flex flex-col gap-6 md:gap-7">
        <ProfileSection user={user} memberRole={memberRole} onSaveIntroduction={notifySaved} />

        {/* 모바일은 카드 대신 구분선으로 섹션을 나눕니다 (Figma 714:4470). */}
        <Divider className="md:hidden" />

        {memberRole === "host" ? (
          <SettlementSection onEdit={() => router.push(ROUTES.settlementAccount)} />
        ) : (
          <GuardianSection onSavePhone={notifySaved} />
        )}
      </div>

      <div className="flex flex-col justify-center gap-4 pt-4">
        <BtnUnderline
          tone="muted"
          disabled={isLoggingOut}
          onClick={() => {
            void logout();
          }}
        >
          {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
        </BtnUnderline>
        <BtnUnderline
          tone="muted"
          disabled={isLoggingOut || isDeletingAccount}
          onClick={() => setDeleteConfirmOpen(true)}
        >
          {isDeletingAccount ? "탈퇴 처리 중..." : "회원 탈퇴"}
        </BtnUnderline>
      </div>

      <Modal
        open={deleteConfirmOpen}
        onClose={handleDeleteConfirmClose}
        title="회원 탈퇴"
        footer={
          <div className="flex w-full gap-2">
            <BtnCta
              variant="stroke"
              size="l"
              className="flex-1"
              disabled={isDeletingAccount}
              onClick={handleDeleteConfirmClose}
            >
              취소
            </BtnCta>
            <BtnCta
              variant="emphasize"
              size="l"
              className="flex-1 bg-system-error! text-white"
              disabled={isDeletingAccount}
              onClick={() => {
                void handleDeleteAccount();
              }}
            >
              {isDeletingAccount ? "처리 중..." : "탈퇴하기"}
            </BtnCta>
          </div>
        }
      >
        <p className="text-body-1 font-medium [word-break:keep-all] text-grayscale-700">
          탈퇴하면 계정 정보가 삭제되며 되돌릴 수 없습니다.
        </p>
      </Modal>
    </MyPageShell>
  );
}

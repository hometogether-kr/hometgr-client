import type { ReactNode } from "react";

import { ShinhanGuestIntake } from "@/widgets/shinhan-guest-intake";
import { ShinhanRoleFooter, ShinhanServiceHeader } from "@/widgets/shinhan-shell";

interface GuestIntakeLayoutProps {
  children: ReactNode;
  notice: ReactNode;
}

function GuestIntakeLayout({ children, notice }: GuestIntakeLayoutProps) {
  return (
    <div className="min-h-screen bg-grayscale-50 text-grayscale-900">
      <ShinhanServiceHeader
        mode="guest"
        skipTarget="#shinhan-guest-intake"
        skipLabel="신청 내용으로 건너뛰기"
      />
      <main id="shinhan-guest-intake">
        <p className="mx-auto mt-6 max-w-[1120px] rounded-xl bg-primary-50 px-5 py-3 text-sm leading-6 text-grayscale-700">
          {notice}
        </p>
        {children}
      </main>
      <ShinhanRoleFooter />
    </div>
  );
}

export function ShinhanGuestBudgetPage() {
  return (
    <GuestIntakeLayout
      notice={
        <>
          신한 API 저장 검증 화면입니다. ‘상세조건 안내받기’는 서버 저장에 성공한 뒤 접수가
          완료됩니다. 접수 완료와 알림 전달 완료는 다르며, 이 환경에서는 외부 알림톡·시트 반영을
          실행하지 않습니다.
        </>
      }
    >
      <ShinhanGuestIntake applicationType="GUEST_BUDGET" />
    </GuestIntakeLayout>
  );
}

export function ShinhanGuestDemandPage() {
  return (
    <GuestIntakeLayout
      notice={
        <>
          개발 확인용 화면입니다. ‘입력 내용 확인’은 접수되지 않으며, 저장 API 연결이 준비된
          환경에서만 신청을 저장할 수 있습니다.
        </>
      }
    >
      <ShinhanGuestIntake applicationType="GUEST_DEMAND" />
    </GuestIntakeLayout>
  );
}

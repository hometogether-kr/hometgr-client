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
          원하는 예산과 입주 조건을 확인하고 상세 안내를 신청하세요. 접수 완료와 안내 메시지 전달
          완료는 다릅니다.
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
        <>원하는 위치와 입주 조건을 알려 주세요. 접수 완료와 안내 메시지 전달 완료는 다릅니다.</>
      }
    >
      <ShinhanGuestIntake applicationType="GUEST_DEMAND" />
    </GuestIntakeLayout>
  );
}

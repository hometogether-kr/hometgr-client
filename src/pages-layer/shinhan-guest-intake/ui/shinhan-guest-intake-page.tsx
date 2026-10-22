import type { ReactNode } from "react";

import { ShinhanGuestIntake } from "@/widgets/shinhan-guest-intake";
import { ShinhanRoleFooter, ShinhanServiceHeader } from "@/widgets/shinhan-shell";

function GuestIntakeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-grayscale-50 text-grayscale-900">
      <ShinhanServiceHeader
        mode="guest"
        skipTarget="#shinhan-guest-intake"
        skipLabel="신청 내용으로 건너뛰기"
      />
      <main id="shinhan-guest-intake">
        <p className="mx-auto mt-6 max-w-[1120px] rounded-xl bg-primary-50 px-5 py-3 text-sm leading-6 text-grayscale-700">
          개발 확인용 화면입니다. 입력은 이 탭에서만 유지되며 전송·접수되지 않습니다. 실제 신청은
          승인된 동의 전문과 저장 API 연결 후 제공됩니다.
        </p>
        {children}
      </main>
      <ShinhanRoleFooter />
    </div>
  );
}

export function ShinhanGuestBudgetPage() {
  return (
    <GuestIntakeLayout>
      <ShinhanGuestIntake applicationType="GUEST_BUDGET" />
    </GuestIntakeLayout>
  );
}

export function ShinhanGuestDemandPage() {
  return (
    <GuestIntakeLayout>
      <ShinhanGuestIntake applicationType="GUEST_DEMAND" />
    </GuestIntakeLayout>
  );
}

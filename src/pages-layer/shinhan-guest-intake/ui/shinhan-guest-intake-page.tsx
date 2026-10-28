import type { ReactNode } from "react";

import { ShinhanGuestIntake } from "@/widgets/shinhan-guest-intake";
import { ShinhanRoleFooter, ShinhanServiceHeader } from "@/widgets/shinhan-shell";

interface GuestIntakeLayoutProps {
  children: ReactNode;
}

function GuestIntakeLayout({ children }: GuestIntakeLayoutProps) {
  return (
    <div className="min-h-screen bg-grayscale-50 text-grayscale-900">
      <ShinhanServiceHeader
        mode="guest"
        skipTarget="#shinhan-guest-intake"
        skipLabel="신청 내용으로 건너뛰기"
      />
      <main id="shinhan-guest-intake">{children}</main>
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

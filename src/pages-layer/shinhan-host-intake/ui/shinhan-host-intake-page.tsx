import type { ReactNode } from "react";

import {
  ShinhanHostConcerns,
  ShinhanHostGuideActions,
  ShinhanHostPreviewActions,
  ShinhanHostPreviewIncome,
} from "@/features/shinhan-intake";
import { ShinhanHostEstimate } from "@/widgets/shinhan-host-estimate";
import { HostIntroductionFrame, HostResultFrame } from "@/widgets/shinhan-host-followup";
import { ShinhanHostRegistration } from "@/widgets/shinhan-host-registration";
import { ShinhanRoleFooter, ShinhanServiceHeader } from "@/widgets/shinhan-shell";

interface HostIntakeLayoutProps {
  children: ReactNode;
}

function HostIntakeLayout({ children }: HostIntakeLayoutProps) {
  return (
    <div className="min-h-screen bg-grayscale-50 text-grayscale-900">
      <ShinhanServiceHeader
        mode="host"
        skipTarget="#shinhan-host-intake"
        skipLabel="신청 내용으로 건너뛰기"
      />
      <main id="shinhan-host-intake">{children}</main>
      <ShinhanRoleFooter />
    </div>
  );
}

export function ShinhanHostEstimatePage() {
  return (
    <HostIntakeLayout>
      <ShinhanHostEstimate
        result={
          <HostResultFrame income={<ShinhanHostPreviewIncome />}>
            <ShinhanHostPreviewActions />
          </HostResultFrame>
        }
        concerns={<ShinhanHostConcerns />}
        guide={
          <HostIntroductionFrame>
            <ShinhanHostGuideActions />
          </HostIntroductionFrame>
        }
      />
    </HostIntakeLayout>
  );
}

export function ShinhanHostRegistrationPage() {
  return (
    <HostIntakeLayout>
      <ShinhanHostRegistration />
    </HostIntakeLayout>
  );
}

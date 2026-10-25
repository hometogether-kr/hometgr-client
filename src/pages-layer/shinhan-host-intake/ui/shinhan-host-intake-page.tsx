import type { ReactNode } from "react";

import { ShinhanHostEstimate } from "@/widgets/shinhan-host-estimate";
import { ShinhanHostRegistration } from "@/widgets/shinhan-host-registration";
import { ShinhanRoleFooter, ShinhanServiceHeader } from "@/widgets/shinhan-shell";

interface HostIntakeLayoutProps {
  children: ReactNode;
  notice: string;
}

function HostIntakeLayout({ children, notice }: HostIntakeLayoutProps) {
  return (
    <div className="min-h-screen bg-grayscale-50 text-grayscale-900">
      <ShinhanServiceHeader
        mode="host"
        skipTarget="#shinhan-host-intake"
        skipLabel="신청 내용으로 건너뛰기"
      />
      <main id="shinhan-host-intake">
        <p className="mx-auto mt-6 max-w-[1120px] rounded-xl bg-primary-50 px-5 py-3 text-sm leading-6 text-grayscale-700">
          {notice}
        </p>
        {children}
      </main>
      <ShinhanRoleFooter />
    </div>
  );
}

export function ShinhanHostEstimatePage() {
  return (
    <HostIntakeLayout notice="예상 수익을 확인한 뒤 청년 소개서 알림을 별도로 신청할 수 있습니다. 예상 수익 진단만으로는 알림을 신청하지 않습니다.">
      <ShinhanHostEstimate />
    </HostIntakeLayout>
  );
}

export function ShinhanHostRegistrationPage() {
  return (
    <HostIntakeLayout notice="방 등록 신청이 접수되면 입력한 내용을 확인할 수 있습니다. 접수 완료와 안내 메시지 전달 완료는 다릅니다.">
      <ShinhanHostRegistration />
    </HostIntakeLayout>
  );
}

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
    <HostIntakeLayout notice="개발 확인용 화면입니다. ‘예상 수익 확인하기’는 견적을 서버에 저장한 뒤 계산 결과를 표시합니다. 소개서 알림 신청은 결과를 확인한 뒤 별도로 선택하며, 견적 저장만으로 알림을 신청하지 않습니다.">
      <ShinhanHostEstimate />
    </HostIntakeLayout>
  );
}

export function ShinhanHostRegistrationPage() {
  return (
    <HostIntakeLayout notice="개발 확인용 화면입니다. ‘입력 내용 확인’은 저장하지 않으며, ‘방 등록 신청 저장’은 서버에 실제 접수합니다. 저장 성공 응답을 받은 뒤 접수 내역을 표시합니다.">
      <ShinhanHostRegistration />
    </HostIntakeLayout>
  );
}

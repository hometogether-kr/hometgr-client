"use client";

import type { SettlementAccount } from "@/domains/settlement";
import {
  SettlementAccountForm,
  useSettlementAccountForm,
} from "@/features/edit-settlement-account";
import { BtnCta } from "@/shared/ui/btn-cta";
import { useToast } from "@/shared/ui/toast";
import { ResponsiveHeader } from "@/widgets/responsive-header";

export interface SettlementAccountPageProps {
  initialValues?: SettlementAccount;
  onSubmit?: (account: SettlementAccount) => void;
  onBack?: () => void;
}

/**
 * 정산 대금 입금계좌 (Figma: 703:16495)
 *
 * - 모바일: 뒤로가기 GNB + 하단 고정 "완료"
 * - 데스크톱: Navigation + 중앙 카드. 데스크톱 시안이 아직 없어 계정 정보 화면과
 *   같은 카드 폭·여백 규칙을 따랐습니다.
 */
export function SettlementAccountPage({
  initialValues,
  onSubmit,
  onBack,
}: SettlementAccountPageProps) {
  const form = useSettlementAccountForm(initialValues);
  const { showToast } = useToast();

  const handleSubmit = () => {
    const validated = form.validate();
    if (!validated) {
      showToast("입력한 내용을 확인해주세요", { variant: "error" });
      return;
    }
    onSubmit?.(validated);
  };

  const submitButton = (
    <BtnCta size="mobile" className="w-full" onClick={handleSubmit}>
      완료
    </BtnCta>
  );

  return (
    <div className="flex min-h-screen flex-col bg-white md:bg-grayscale-50">
      <ResponsiveHeader mobile={{ variant: "back", onBack }} />

      <main className="flex flex-1 flex-col px-5 pt-2 pb-[104px] md:items-center md:justify-center md:px-5 md:py-16 md:pb-16">
        <div className="flex w-full flex-col gap-10 md:w-[560px] md:rounded-2xl md:bg-white md:px-16 md:py-12">
          <SettlementAccountForm form={form} />
          <div className="hidden md:block">{submitButton}</div>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 bg-white px-5 pt-2 pb-6 md:hidden">
        {submitButton}
      </div>
    </div>
  );
}

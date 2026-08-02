"use client";

import { TermsAgreementList, useTermsAgreement } from "@/features/agree-terms";
import { BtnCta } from "@/shared/ui/btn-cta";
import { useToast } from "@/shared/ui/toast";
import { OnboardingLayout } from "@/widgets/onboarding-layout";

export interface OnboardingTermsPageProps {
  onSubmit?: (agreedIds: readonly string[]) => void;
  onBack?: () => void;
}

/**
 * 약관 동의 (Figma: 데스크톱 643:19217·643:19267 · 모바일 749:17279·693:13825)
 *
 * 필수 약관을 모두 체크해야 CTA가 활성화됩니다. Figma 749:17266처럼 비활성
 * 상태에서 누르면 안내 토스트를 띄웁니다.
 */
export function OnboardingTermsPage({ onSubmit, onBack }: OnboardingTermsPageProps) {
  const agreement = useTermsAgreement();
  const { showToast } = useToast();

  const handleSubmit = () => {
    if (!agreement.requiredSatisfied) {
      showToast("필수항목에 동의해주세요", { variant: "error" });
      return;
    }
    onSubmit?.(agreement.agreedIds);
  };

  return (
    <OnboardingLayout
      title="서비스 이용을 위해 동의가 필요해요"
      onBack={onBack}
      footer={
        <BtnCta
          size="mobile"
          aria-disabled={!agreement.requiredSatisfied}
          className={[
            "w-full md:h-[52px]",
            /*
             * disabled 속성 대신 aria-disabled로 비활성 스타일만 적용합니다.
             * Figma 749:17266처럼 필수 항목을 건너뛰고 눌렀을 때 안내 토스트를
             * 띄우려면 클릭 이벤트가 살아 있어야 합니다.
             */
            !agreement.requiredSatisfied &&
              "bg-grayscale-200 text-grayscale-400 hover:opacity-100",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={handleSubmit}
        >
          동의하고 시작하기
        </BtnCta>
      }
    >
      <TermsAgreementList agreement={agreement} />
    </OnboardingLayout>
  );
}

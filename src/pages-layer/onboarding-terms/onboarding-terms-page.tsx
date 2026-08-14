"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";

import type { UserConsents } from "@/domains/user";
import { useSession } from "@/domains/user";
import {
  getAgreedTermIdsFromConsents,
  getTermsWithConsentRequirements,
  TermsAgreementList,
  useSubmitTermsConsents,
  useTermsAgreement,
} from "@/features/agree-terms";
import { ApiError } from "@/shared/api";
import { ROUTES } from "@/shared/config";
import { BtnCta } from "@/shared/ui/btn-cta";
import { useToast } from "@/shared/ui/toast";
import { OnboardingLayout } from "@/widgets/onboarding-layout";

export interface OnboardingTermsPageProps {
  onBack?: () => void;
  onComplete?: () => void;
}

const TERMS_BODY_ERROR_CODES = new Set(["INVALID_ME_BODY", "INVALID_CONSENT_BODY"]);

function getSubmitErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return "약관 동의를 저장하지 못했습니다.";

  if (
    error.kind === "validation" &&
    ((error.code && TERMS_BODY_ERROR_CODES.has(error.code)) ||
      TERMS_BODY_ERROR_CODES.has(error.message))
  ) {
    return "약관 동의 항목을 다시 확인해주세요.";
  }

  return error.message;
}

interface OnboardingTermsFormProps {
  consents: UserConsents | null;
  onBack: () => void;
  onComplete: () => void;
}

function OnboardingTermsForm({ consents, onBack, onComplete }: OnboardingTermsFormProps) {
  const terms = useMemo(() => getTermsWithConsentRequirements(consents), [consents]);
  const initialAgreedIds = useMemo(() => getAgreedTermIdsFromConsents(consents), [consents]);
  const agreement = useTermsAgreement({ terms, initialAgreedIds });
  const { submitTermsConsents, isSubmitting } = useSubmitTermsConsents();
  const { showToast } = useToast();

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!agreement.requiredSatisfied) {
      showToast("필수항목에 동의해주세요", { variant: "error" });
      return;
    }

    try {
      await submitTermsConsents({ agreedIds: agreement.agreedIds });
      onComplete();
    } catch (error) {
      showToast(getSubmitErrorMessage(error), { variant: "error" });
    }
  };

  return (
    <OnboardingLayout
      title="서비스 이용을 위해 동의가 필요해요"
      onBack={onBack}
      /*
       * disabled 속성 대신 aria-disabled를 씁니다. Figma 749:17266처럼 필수 항목을
       * 건너뛰고 눌렀을 때 안내 토스트를 띄우려면 클릭 이벤트가 살아 있어야 합니다.
       * 비활성 스타일은 BtnCta가 aria-disabled를 보고 직접 적용합니다.
       */
      footer={
        <BtnCta
          size="mobile"
          aria-disabled={!agreement.requiredSatisfied}
          disabled={isSubmitting}
          className="w-full md:h-[52px]"
          onClick={() => void handleSubmit()}
        >
          {isSubmitting ? "저장 중..." : "동의하고 시작하기"}
        </BtnCta>
      }
    >
      <TermsAgreementList agreement={agreement} />
    </OnboardingLayout>
  );
}

/**
 * 약관 동의 (Figma: 데스크톱 643:19217·643:19267 · 모바일 749:17279·693:13825)
 *
 * 필수 약관을 모두 체크해야 CTA가 활성화됩니다. Figma 749:17266처럼 비활성
 * 상태에서 누르면 안내 토스트를 띄웁니다.
 */
export function OnboardingTermsPage({ onBack, onComplete }: OnboardingTermsPageProps) {
  const router = useRouter();
  const { session, isLoading, isAuthenticated } = useSession();

  const handleBack = onBack ?? (() => router.push(ROUTES.auth.login));
  const handleComplete = onComplete ?? (() => router.push(ROUTES.auth.role));

  if (isLoading) {
    return (
      <OnboardingLayout title="서비스 이용을 위해 동의가 필요해요" onBack={handleBack}>
        <p className="py-10 text-center text-body-1 font-medium text-grayscale-600">
          불러오는 중...
        </p>
      </OnboardingLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <OnboardingLayout
        title="로그인이 필요해요"
        onBack={handleBack}
        footer={
          <BtnCta
            size="mobile"
            className="w-full md:h-[52px]"
            onClick={() => router.push(ROUTES.auth.login)}
          >
            로그인하러 가기
          </BtnCta>
        }
      >
        <p className="py-10 text-center text-body-1 font-medium text-grayscale-600">
          약관 동의는 로그인 후 진행할 수 있어요.
        </p>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingTermsForm
      consents={session.consents}
      onBack={handleBack}
      onComplete={handleComplete}
    />
  );
}

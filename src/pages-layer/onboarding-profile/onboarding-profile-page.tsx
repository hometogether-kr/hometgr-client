"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  ACCOUNT_MODE_HOME,
  type AccountMode,
  useAccountMode,
  userQueryKeys,
  useSession,
} from "@/domains/user";
import {
  clearOnboardingTermsAgreement,
  hasRequiredOnboardingTermsAgreement,
  isOnboardingTermAgreed,
} from "@/features/agree-terms";
import {
  completeOnboarding,
  OnboardingProfileForm,
  type OnboardingProfileValues,
} from "@/features/complete-onboarding";
import { ROUTES } from "@/shared/config";
import { formatKoreanPhone } from "@/shared/lib/korean-phone";
import { OnboardingLayout } from "@/widgets/onboarding-layout";

interface OnboardingProfilePageProps {
  returnMode: AccountMode;
}

export function OnboardingProfilePage({ returnMode }: OnboardingProfilePageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { session, isAuthenticated, isLoading } = useSession({ mode: "always" });
  const { setMode } = useAccountMode();
  const [formError, setFormError] = useState<string>();

  // 세션과 브라우저에 저장된 동의 기록을 확인한 뒤 가입 화면에 머물 수 있습니다.
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace(ROUTES.auth.login + "?error=session_expired");
    } else if (!session.onboardingRequired) {
      router.replace(ACCOUNT_MODE_HOME[returnMode]);
    } else if (!hasRequiredOnboardingTermsAgreement()) {
      router.replace(ROUTES.auth.terms);
    }
  }, [isLoading, isAuthenticated, session.onboardingRequired, returnMode, router]);

  const mutation = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: (nextSession) => {
      if (nextSession.onboardingRequired) {
        setFormError("가입이 완료되지 않았습니다. 입력 정보와 약관 동의를 확인해주세요.");
        return;
      }
      clearOnboardingTermsAgreement();
      setMode(returnMode);
      queryClient.setQueryData(userQueryKeys.me(), nextSession);
      router.replace(ACCOUNT_MODE_HOME[returnMode]);
    },
    onError: () => setFormError("가입을 완료하지 못했습니다. 잠시 후 다시 시도해주세요."),
  });

  function handleSubmit(values: OnboardingProfileValues) {
    if (mutation.isPending) return;
    setFormError(undefined);
    if (!hasRequiredOnboardingTermsAgreement()) {
      router.push(ROUTES.auth.terms);
      return;
    }
    if (!session.user?.email) {
      setFormError("카카오 계정 이메일 제공 동의가 필요합니다. 다시 로그인해주세요.");
      return;
    }
    const phone = formatKoreanPhone(values.phone);
    if (!phone) {
      setFormError("휴대폰 번호 형식을 확인해주세요.");
      return;
    }
    mutation.mutate({
      ...values,
      phone,
      email: session.user.email,
      marketingOptIn: isOnboardingTermAgreed("marketing"),
    });
  }

  return (
    <OnboardingLayout
      title="기본 정보를 확인해주세요"
      description="이름과 연락처를 확인하면 가입이 완료됩니다."
      onBack={() => router.push(ROUTES.auth.terms)}
    >
      {isLoading || !session.user || !session.onboardingRequired ? (
        <div className="min-h-[340px]" role="status">
          가입 정보를 확인하고 있습니다.
        </div>
      ) : (
        <OnboardingProfileForm
          key={session.user.id}
          initialName={session.user.name ?? ""}
          initialPhone={session.user.phone ?? ""}
          isSubmitting={mutation.isPending}
          error={formError}
          onSubmit={handleSubmit}
        />
      )}
    </OnboardingLayout>
  );
}

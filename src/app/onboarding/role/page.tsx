"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { completeOnboarding, type MemberRole, userQueryKeys, useSession } from "@/domains/user";
import {
  clearOnboardingTermsAgreement,
  hasRequiredOnboardingTermsAgreement,
} from "@/features/agree-terms";
import { OnboardingRolePage } from "@/pages-layer/onboarding-role";
import { ROUTES } from "@/shared/config";
import { formatKoreanPhone } from "@/shared/lib/korean-phone";
import { useToast } from "@/shared/ui/toast";

export default function Page() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { session, isAuthenticated, isLoading } = useSession();
  const { showToast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`${ROUTES.auth.login}?error=session_expired`);
    }
  }, [isAuthenticated, isLoading, router]);

  const mutation = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: (nextSession) => {
      clearOnboardingTermsAgreement();
      queryClient.setQueryData(userQueryKeys.me(), nextSession);
      router.replace(ROUTES.home);
    },
    onError: () => {
      showToast("가입을 완료하지 못했습니다. 입력 정보를 확인해주세요.", {
        variant: "error",
      });
    },
  });

  const handleSelect = (role: MemberRole, profile: { name: string; phone: string }) => {
    if (!hasRequiredOnboardingTermsAgreement()) {
      showToast("약관 동의를 먼저 진행해주세요.", { variant: "error" });
      router.push(ROUTES.auth.terms);
      return;
    }

    const { user } = session;
    if (!user?.email) {
      showToast("카카오 계정 이메일 제공 동의가 필요합니다.", { variant: "error" });
      return;
    }

    const phone = formatKoreanPhone(profile.phone);
    if (!phone) {
      showToast("휴대폰 번호 형식을 확인해주세요.", { variant: "error" });
      return;
    }

    mutation.mutate({
      role,
      name: profile.name,
      email: user.email,
      phone,
    });
  };

  return (
    <OnboardingRolePage
      key={session?.user?.id ?? "anonymous"}
      initialName={session?.user?.name ?? ""}
      initialPhone={session?.user?.phone ?? ""}
      isSubmitting={mutation.isPending || isLoading}
      validatePhone={(phone) => formatKoreanPhone(phone) !== null}
      onSelect={handleSelect}
      onBack={() => router.push(ROUTES.auth.terms)}
    />
  );
}

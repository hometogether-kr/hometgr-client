"use client";

import { useRouter } from "next/navigation";

import { saveOnboardingTermsAgreement } from "@/features/agree-terms";
import { OnboardingTermsPage } from "@/pages-layer/onboarding-terms";
import { ROUTES } from "@/shared/config";

export default function Page() {
  const router = useRouter();

  return (
    <OnboardingTermsPage
      onSubmit={(agreedIds) => {
        saveOnboardingTermsAgreement(agreedIds);
        router.push(ROUTES.auth.role);
      }}
      onBack={() => router.push(ROUTES.auth.login)}
    />
  );
}

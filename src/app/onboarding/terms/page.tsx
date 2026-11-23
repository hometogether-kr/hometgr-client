"use client";

import { useRouter } from "next/navigation";

import { saveOnboardingTermsAgreement } from "@/features/agree-terms";
import { OnboardingTermsPage } from "@/pages-layer/onboarding-terms";
import { ROUTES } from "@/shared/config";
import { parseAuthReturnPath } from "@/shared/lib/auth-return";

export default function Page() {
  const router = useRouter();

  return (
    <OnboardingTermsPage
      onSubmit={(agreedIds) => {
        saveOnboardingTermsAgreement(agreedIds);
        router.push(ROUTES.auth.profile);
      }}
      onBack={() => {
        const returnTo = parseAuthReturnPath(
          new URLSearchParams(window.location.search).get("returnTo"),
        );
        const params = new URLSearchParams();
        if (returnTo) params.set("returnTo", returnTo);
        router.push(`${ROUTES.auth.login}${params.size ? `?${params}` : ""}`);
      }}
    />
  );
}

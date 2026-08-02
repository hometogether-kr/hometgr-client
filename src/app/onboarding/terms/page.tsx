"use client";

import { useRouter } from "next/navigation";
import { OnboardingTermsPage } from "@/pages-layer/onboarding-terms";
import { ROUTES } from "@/shared/config";

export default function Page() {
  const router = useRouter();

  return (
    <OnboardingTermsPage
      // TODO: 동의 결과를 서버에 저장한 뒤 이동하도록 교체하세요.
      onSubmit={() => router.push(ROUTES.auth.role)}
      onBack={() => router.push(ROUTES.auth.login)}
    />
  );
}

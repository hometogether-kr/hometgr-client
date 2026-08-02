"use client";

import { useRouter } from "next/navigation";
import type { MemberRole } from "@/domains/user";
import { OnboardingRolePage } from "@/pages-layer/onboarding-role";
import { ROUTES } from "@/shared/config";

export default function Page() {
  const router = useRouter();

  // TODO: 선택한 회원 유형을 서버에 저장한 뒤 이동하도록 교체하세요.
  const handleSelect = (role: MemberRole) => {
    router.push(role === "host" ? ROUTES.listing.start : ROUTES.rooms);
  };

  return (
    <OnboardingRolePage onSelect={handleSelect} onBack={() => router.push(ROUTES.auth.terms)} />
  );
}

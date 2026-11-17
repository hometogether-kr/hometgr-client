// 카카오 개인정보 동의항목 심사용 임시 화면입니다.
// 심사가 끝나고 화면이 더 이상 필요 없으면 아래 디렉터리 3개를 함께 삭제합니다.
// - src/app/signup
// - src/pages-layer/signup
// - src/features/signup-form
// 삭제할 때 src/app/onboarding/terms/page.tsx의 약관 동의 후 이동 경로를
// ROUTES.auth.profile로 되돌리고, 빌드에서 `/signup` 라우트가 빠졌는지 확인합니다.
import { z } from "zod";

import { SignupPage } from "@/pages-layer/signup";

interface SignupRouteProps {
  searchParams: Promise<{ from?: string | string[] }>;
}

const onboardingSourceSchema = z.literal("onboarding");

export default async function Page({ searchParams }: SignupRouteProps) {
  const { from } = await searchParams;
  return <SignupPage continueOnboarding={onboardingSourceSchema.safeParse(from).success} />;
}

import { cookies } from "next/headers";

import { AUTH_MODE_COOKIE, resolveAccountMode } from "@/domains/user";
import { OnboardingProfilePage } from "@/pages-layer/onboarding-profile";
import { AUTH_RETURN_TO_COOKIE, parseAuthReturnPath } from "@/shared/lib/auth-return";

export default async function Page() {
  const cookieStore = await cookies();
  const returnMode = resolveAccountMode({
    pageMode: null,
    savedMode: cookieStore.get(AUTH_MODE_COOKIE)?.value,
  });
  const returnTo = parseAuthReturnPath(cookieStore.get(AUTH_RETURN_TO_COOKIE)?.value);
  return <OnboardingProfilePage returnMode={returnMode} returnTo={returnTo} />;
}

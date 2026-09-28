import { ACCOUNT_MODE_HOME, getPageAccountMode, resolveAccountMode } from "@/domains/user";

interface AccountModeNavigationInput {
  pathname: string;
  savedMode: unknown;
}

export function getAccountModeNavigation({ pathname, savedMode }: AccountModeNavigationInput) {
  const pageMode = getPageAccountMode(pathname);
  const mode = resolveAccountMode({ pageMode, savedMode });
  const nextMode = mode === "host" ? "guest" : "host";
  return {
    mode,
    homeHref: ACCOUNT_MODE_HOME[mode],
    canShowModeSwitch: pageMode !== null,
    nextMode,
    nextHomeHref: ACCOUNT_MODE_HOME[nextMode],
  };
}

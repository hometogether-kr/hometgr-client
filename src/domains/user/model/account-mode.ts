import { z } from "zod";

import { ROUTES } from "@/shared/config";

export const accountModeSchema = z.enum(["host", "guest"]);
export type AccountMode = z.infer<typeof accountModeSchema>;

export const ACCOUNT_MODE_HOME = {
  guest: ROUTES.intro.guest,
  host: ROUTES.intro.host,
} as const satisfies Record<AccountMode, string>;

export function getPageAccountMode(pathname: string): AccountMode | null {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === ACCOUNT_MODE_HOME.guest) return "guest";
  if (path === ACCOUNT_MODE_HOME.host) return "host";
  return null;
}

export const AUTH_MODE_COOKIE = "hometgr_auth_mode";

export const DEFAULT_ACCOUNT_MODE: AccountMode = "guest";
export const ACCOUNT_MODE_LABELS: Record<AccountMode, string> = {
  host: "집주인 모드",
  guest: "게스트 모드",
};

interface ResolveAccountModeInput {
  pageMode: AccountMode | null;
  savedMode: unknown;
}

/** 메인 URL의 명시적 선택이 저장값보다 우선하며, 서버 권한은 화면 모드에 관여하지 않습니다. */
export function resolveAccountMode({ pageMode, savedMode }: ResolveAccountModeInput): AccountMode {
  if (pageMode) return pageMode;
  const parsed = accountModeSchema.safeParse(savedMode);
  return parsed.success ? parsed.data : DEFAULT_ACCOUNT_MODE;
}

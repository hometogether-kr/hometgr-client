import { cookies } from "next/headers";

/**
 * 세션 쿠키
 *
 * 토큰은 브라우저 JavaScript가 읽을 수 없도록 httpOnly 쿠키에만 보관합니다.
 * (API 문서 권장: refresh token을 localStorage/sessionStorage/IndexedDB에 두지 않음)
 */
const ACCESS_TOKEN_COOKIE = "ht_access_token";
const REFRESH_TOKEN_COOKIE = "ht_refresh_token";
const OAUTH_STATE_COOKIE = "ht_oauth_state";

/** 카카오 인증 화면을 오가는 동안만 유지하면 되는 값입니다. */
const OAUTH_STATE_MAX_AGE_SECONDS = 10 * 60;
const REFRESH_TOKEN_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

const isProduction = process.env.NODE_ENV === "production";

const BASE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  /**
   * 카카오가 외부 origin에서 콜백으로 돌려보내므로 strict를 쓰면 첫 요청에
   * 쿠키가 실리지 않습니다. lax면 top-level GET 이동에는 전송됩니다.
   */
  sameSite: "lax",
  path: "/",
} as const;

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * 세션 쿠키가 있는지만 확인합니다.
 *
 * 토큰의 유효성까지는 알 수 없지만, 첫 HTML을 로그인 상태로 그릴지 판단하는 데는
 * 충분합니다. 실제 검증은 클라이언트에서 `/me`를 받아 확정합니다.
 */
export async function hasSessionCookie(): Promise<boolean> {
  const cookieStore = await cookies();

  return cookieStore.has(ACCESS_TOKEN_COOKIE) || cookieStore.has(REFRESH_TOKEN_COOKIE);
}

export async function readSessionTokens(): Promise<Partial<SessionTokens>> {
  const cookieStore = await cookies();

  return {
    accessToken: cookieStore.get(ACCESS_TOKEN_COOKIE)?.value,
    refreshToken: cookieStore.get(REFRESH_TOKEN_COOKIE)?.value,
  };
}

/**
 * access token은 만료 시각을 알 수 없어 세션 쿠키로 두고,
 * 브라우저를 다시 열었을 때는 refresh token으로 복구합니다.
 */
export async function writeSessionTokens({
  accessToken,
  refreshToken,
}: SessionTokens): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, BASE_COOKIE_OPTIONS);
  cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...BASE_COOKIE_OPTIONS,
    maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
  });
}

export async function clearSessionTokens(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
}

/**
 * 백엔드가 발급한 OAuth state 쿠키를 그대로 보관합니다.
 *
 * 콜백에서 백엔드에 다시 돌려줘야 state 검증을 통과할 수 있어, 값을 해석하지 않고
 * `name=value` 문자열 그대로 저장합니다.
 */
export async function writeOAuthStateCookie(rawCookiePair: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(OAUTH_STATE_COOKIE, rawCookiePair, {
    ...BASE_COOKIE_OPTIONS,
    maxAge: OAUTH_STATE_MAX_AGE_SECONDS,
  });
}

/**
 * `Set-Cookie` 헤더 목록에서 `name=value` 쌍만 뽑아 `Cookie` 헤더 값으로 만듭니다.
 * Path·HttpOnly 같은 속성은 백엔드로 되돌려 보낼 때 필요하지 않습니다.
 */
export function toCookieHeaderValue(setCookieHeaders: readonly string[]): string {
  return setCookieHeaders
    .map((header) => header.split(";", 1)[0].trim())
    .filter(Boolean)
    .join("; ");
}

export async function readOAuthStateCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(OAUTH_STATE_COOKIE)?.value;
}

export async function clearOAuthStateCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(OAUTH_STATE_COOKIE);
}

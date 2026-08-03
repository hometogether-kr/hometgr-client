import { z } from "zod";

import { getServerEnv } from "@/shared/config/env.server";

/** 토큰 쌍 (OpenAPI: TokenPairResponseDto) — 세션 인프라가 다루는 값입니다. */
export const tokenPairSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});

export type TokenPair = z.infer<typeof tokenPairSchema>;

export interface BackendRequestInit extends Omit<RequestInit, "headers"> {
  headers?: Record<string, string>;
  accessToken?: string;
}

/**
 * BFF에서 API 서버로 보내는 요청
 *
 * 서버끼리의 통신이므로 브라우저 캐시·쿠키 전달 규칙과 무관하게 매번 새로 호출합니다.
 */
export function backendFetch(path: string, init: BackendRequestInit = {}): Promise<Response> {
  const { accessToken, headers, ...rest } = init;
  const { API_BASE_URL } = getServerEnv();

  return fetch(new URL(path, API_BASE_URL), {
    ...rest,
    cache: "no-store",
    headers: {
      ...headers,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });
}

/**
 * refresh token으로 토큰 쌍을 재발급합니다.
 *
 * 실패는 "다시 로그인해야 하는 상태"라는 하나의 결과로만 필요하므로 예외 대신
 * `null`을 반환합니다.
 */
export async function refreshTokenPair(refreshToken: string): Promise<TokenPair | null> {
  let response: Response;

  try {
    response = await backendFetch("/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    return null;
  }

  if (!response.ok) return null;

  const parsed = tokenPairSchema.safeParse(await response.json().catch(() => null));
  return parsed.success ? parsed.data : null;
}

import { ApiError, apiRequest } from "@/shared/api";
import { ANONYMOUS_SESSION, type Session } from "../model/current-user";
import { meResponseDtoSchema } from "./user.dto";
import { toSession } from "./user.mapper";

/**
 * 현재 세션 조회
 *
 * 비로그인은 오류가 아니라 정상적인 상태이므로 401을 익명 세션으로 바꿔 돌려줍니다.
 * 그 외 오류는 화면이 구분해서 처리할 수 있도록 그대로 전달합니다.
 */
export async function fetchSession(signal?: AbortSignal): Promise<Session> {
  try {
    const dto = await apiRequest({
      path: "/me",
      schema: meResponseDtoSchema,
      signal,
    });

    return toSession(dto);
  } catch (error) {
    if (error instanceof ApiError && error.isUnauthorized) return ANONYMOUS_SESSION;
    throw error;
  }
}

/** 세션 쿠키를 지웁니다. BFF 경로라 API 프록시를 거치지 않습니다. */
export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}

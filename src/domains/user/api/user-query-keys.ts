/**
 * user 도메인 쿼리 키
 *
 * 무효화 범위를 한곳에서 관리하기 위해 문자열을 직접 쓰지 않고 이 객체만 사용합니다.
 */
export const userQueryKeys = {
  all: ["user"] as const,
  me: () => [...userQueryKeys.all, "me"] as const,
};

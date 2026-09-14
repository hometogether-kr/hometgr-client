/**
 * room 도메인 쿼리 키
 *
 * 목록 키는 "정규화된 필터 문자열" 하나를 받습니다. 필터 객체를 그대로 키에 넣으면
 * 키 순서·`undefined` 유무 차이로 같은 조건이 다른 캐시로 갈리기 때문입니다(설계 §2-6).
 * URL 직렬화 함수(B/HOM-207)의 결과를 그대로 넘기면 정규화가 따라옵니다.
 * 필터가 없는 기본 목록은 빈 문자열(`""`)을 씁니다.
 *
 * 페이지 번호는 키에 넣지 않습니다 — 무한 쿼리가 한 키 아래 페이지들을 누적합니다.
 */
export const roomQueryKeys = {
  all: ["room"] as const,
  lists: () => [...roomQueryKeys.all, "list"] as const,
  list: (normalizedFilter: string) => [...roomQueryKeys.lists(), normalizedFilter] as const,
};

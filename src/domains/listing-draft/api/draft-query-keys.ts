/**
 * listing-draft 도메인 쿼리 키
 *
 * 단계 저장은 초안 하나만 바꾸므로 `detail(draftId)`만 갱신하고,
 * 생성·제출처럼 목록이 달라지는 변경에서만 `lists()`를 무효화합니다.
 */
export const listingDraftQueryKeys = {
  all: ["listing-draft"] as const,
  lists: () => [...listingDraftQueryKeys.all, "list"] as const,
  details: () => [...listingDraftQueryKeys.all, "detail"] as const,
  detail: (draftId: string) => [...listingDraftQueryKeys.details(), draftId] as const,
};

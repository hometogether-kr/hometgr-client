/** 매물 등록 10단계 정의 (Figma: Stepper, node 420:6701) */
export const LISTING_STEPS = [
  "등록자 정보",
  "장소 기본 정보",
  "상세 정보",
  "게스트 공간 정보",
  "공용 시설 정보",
  "생활 안내 및 규칙",
  "계약 조건",
  "사진 업로드",
  "방 설명 작성",
  "최종 확인",
] as const;

export type ListingStepIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

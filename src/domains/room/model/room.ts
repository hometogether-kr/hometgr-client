/**
 * 매물(공개 조회) 엔티티
 *
 * 입주자가 목록에서 보는 매물입니다. 집주인이 작성하는 `listing-draft`와는 shape·
 * 라이프사이클이 달라 도메인을 분리합니다(초안은 편집 상태, 매물은 게시된 결과).
 *
 * 서버 컴포넌트가 조회해 클라이언트로 props로 내려보낼 수 있어야 하므로, 이 모델은
 * 전부 직렬화 가능한 값만 담습니다. 날짜는 `Date`가 아니라 `"YYYY-MM-DD"` 문자열입니다.
 */

/** 예약 가능 여부 */
export const ROOM_AVAILABILITIES = ["available", "unavailable"] as const;
export type RoomAvailability = (typeof ROOM_AVAILABILITIES)[number];

export interface Room {
  id: string;
  /** 건물명 — 예) "강남 센트럴 푸르지오 시티" */
  buildingName: string;
  /** 보증금 (만원 단위). 예) 1000 */
  deposit: number;
  /** 월세 (만원 단위). 예) 80 */
  monthlyRent: number;
  /** 동 — 예) "역삼동" */
  neighborhood: string;
  /** 교통 요약 — 예) "강남역 도보 5분" */
  transitSummary: string;
  /** 대표 사진 URL */
  thumbnailUrl: string;
  availability: RoomAvailability;
  /** 입주 가능일 — "YYYY-MM-DD" (미정이면 null) */
  availableFrom: string | null;
}

/** 목록 한 페이지의 조회 결과 */
export interface RoomListResult {
  rooms: Room[];
  /** 조건에 맞는 전체 매물 수 — "총 N개" 표시에 사용 */
  totalCount: number;
  /** 현재까지 로드한 페이지 번호 (1부터) */
  page: number;
  /** 다음 페이지 존재 여부 — "더 보기" 노출 판단 (B/HOM-207) */
  hasNext: boolean;
}

/**
 * 정렬 값 (설계 §3.5)
 *
 * `recommended`가 기본값이라 URL·쿼리 키에는 생략합니다. 라벨 맵을 `Record`로 두어
 * 옵션을 추가하면 라벨 누락이 컴파일 에러로 잡히게 합니다.
 * 목록 UI 연결(정렬 드롭다운)은 B(HOM-207)에서 붙습니다.
 */
export const ROOM_SORTS = ["recommended", "latest", "rentAsc", "depositAsc", "moveInAsc"] as const;
export type RoomSort = (typeof ROOM_SORTS)[number];

export const ROOM_SORT_LABEL: Record<RoomSort, string> = {
  recommended: "추천순",
  latest: "최신순",
  rentAsc: "월세 저렴한순",
  depositAsc: "보증금 저렴한순",
  moveInAsc: "입주 가능일 빠른순",
};

/** 정렬 기본값 — URL·쿼리 키에서 생략되는 캐노니컬 값 */
export const DEFAULT_ROOM_SORT: RoomSort = "recommended";

/**
 * 매물(공개 조회) 엔티티
 *
 * 입주자가 목록에서 보는 매물입니다. 집주인이 작성하는 `listing-draft`와는 shape·
 * 라이프사이클이 달라 도메인을 분리합니다(초안은 편집 상태, 매물은 게시된 결과).
 *
 * 서버 컴포넌트가 조회해 클라이언트로 props로 내려보낼 수 있어야 하므로, 이 모델은
 * 전부 직렬화 가능한 값만 담습니다. 날짜는 `Date`가 아니라 `"YYYY-MM-DD"` 문자열입니다.
 *
 * ⚠️ 실제 `GET /rooms`는 stage-0 주소 정책이 적용돼 있어 일부 필드가 비어 옵니다:
 * `title`(→buildingName)이 null일 수 있고, 교통 요약에 대응하는 필드가 없으며,
 * 위치는 동이 아니라 구 단위(`"서울시 강남구"`)입니다. 그래서 아래 필드들을 nullable로
 * 둡니다 — 카드는 값이 없을 때 대체 표시합니다. (설계 §11, 디자이너 확인 대기)
 */

/** 예약 가능 여부 */
export const ROOM_AVAILABILITIES = ["available", "unavailable"] as const;
export type RoomAvailability = (typeof ROOM_AVAILABILITIES)[number];

export interface Room {
  id: string;
  /** 건물명 — API `title`. 실데이터에서 null이면 매퍼가 지역 문자열로 폴백 */
  buildingName: string;
  /** 보증금 (만원 단위). 서버가 null이면 "가격 문의" 표시. 예) 1000 */
  deposit: number | null;
  /** 월세 (만원 단위). 예) 80 */
  monthlyRent: number | null;
  /** 위치 — API `addressRegion`. 구 단위. 예) "서울시 강남구" */
  neighborhood: string;
  /** 교통 요약 — stage-0 정책상 대개 null (대응 API 필드 없음) */
  transitSummary: string | null;
  /** 대표 사진 URL — 만료되는 S3 서명 URL. media 없으면 null → 카드가 대체 표시 */
  thumbnailUrl: string | null;
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
 *
 * ⚠️ 실제 API에는 "추천" 정렬이 없습니다(`sortBy`: createdAt·monthlyRentKrw·depositKrw·
 * availableFrom). `recommended`는 API 기본값(createdAt DESC)으로 매핑되어 현재는 `latest`와
 * 결과가 같습니다 — 서버 추천 정렬이 생기면 매퍼만 바꿉니다. (room.api.ts `SORT_PARAM`)
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
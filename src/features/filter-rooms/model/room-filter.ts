import type {
  ContractTerm,
  GenderPreference,
  OccupancyCount,
  RoomListQuery,
  RoomSort,
  RoomType,
} from "@/domains/room";
import { DEFAULT_ROOM_SORT } from "@/domains/room";

/**
 * 매물 목록 필터 (사용자 행동 관점)
 *
 * URL 쿼리스트링이 단일 진실 소스입니다. 서버가 `parseRoomFilter`로 읽어 이 shape으로
 * 만들고, 화면은 이 값을 props로 받습니다. 날짜는 Server→Client 직렬화를 위해 `Date`가
 * 아니라 "YYYY-MM-DD" 문자열입니다(설계 §5·§6.0c).
 *
 * `sort`·`page`는 항상 값이 있고(기본 recommended·1), 나머지 조건은 미설정 시 null 또는
 * 빈 배열입니다.
 */
export interface RoomFilter {
  keyword: string | null;
  sido: string | null;
  sigungu: string | null;
  moveInDate: string | null;
  minTerm: ContractTerm | null;
  depositMin: number | null;
  depositMax: number | null;
  rentMin: number | null;
  rentMax: number | null;
  roomTypes: RoomType[];
  people: OccupancyCount | null;
  gender: GenderPreference | null;
  sort: RoomSort;
  page: number;
}

/** 아무 조건도 없는 기본 필터 (캐노니컬 상태 — URL에 아무 파라미터도 없음) */
export const EMPTY_ROOM_FILTER: RoomFilter = {
  keyword: null,
  sido: null,
  sigungu: null,
  moveInDate: null,
  minTerm: null,
  depositMin: null,
  depositMax: null,
  rentMin: null,
  rentMax: null,
  roomTypes: [],
  people: null,
  gender: null,
  sort: DEFAULT_ROOM_SORT,
  page: 1,
};

/**
 * 정렬·페이지를 제외하고 조건이 하나라도 걸려 있는지.
 *
 * 결과 0일 때 빈 상태를 `all`(조건 없음) / `filtered`(조건 있음)로 가르고, 칩 바의
 * "초기화" 노출 판단에 씁니다. 정렬은 항상 값이 있으므로 "활성 필터"로 치지 않습니다.
 */
export function isRoomFilterActive(filter: RoomFilter): boolean {
  return (
    filter.keyword !== null ||
    filter.sido !== null ||
    filter.sigungu !== null ||
    filter.moveInDate !== null ||
    filter.minTerm !== null ||
    filter.depositMin !== null ||
    filter.depositMax !== null ||
    filter.rentMin !== null ||
    filter.rentMax !== null ||
    filter.roomTypes.length > 0 ||
    filter.people !== null ||
    filter.gender !== null
  );
}

/**
 * RoomFilter → 정규화된 쿼리스트링 (앞의 "?" 없음)
 *
 * - 기본값(sort=recommended, page=1)과 null·빈 값은 생략 → 캐노니컬 URL 1개(설계 §3.4)
 * - 배열(type)은 같은 key 반복. 선택 순서와 무관하게 같은 조건이 같은 문자열이 되도록
 *   중복 제거 후 정렬합니다 — 이 문자열을 그대로 쿼리 키로 쓰므로 정규화가 필수입니다(§2-6)
 * - `http-client.ts`의 buildUrl과 같은 규칙(빈 값 제거·배열 key 반복)을 따릅니다
 */
export function serializeRoomFilter(filter: RoomFilter): string {
  const params = new URLSearchParams();
  const setStr = (key: string, value: string | null) => {
    if (value) params.set(key, value);
  };
  const setNum = (key: string, value: number | null) => {
    if (value !== null) params.set(key, String(value));
  };

  setStr("q", filter.keyword);
  setStr("sido", filter.sido);
  setStr("sigungu", filter.sigungu);
  setStr("moveIn", filter.moveInDate);
  setStr("term", filter.minTerm);
  setNum("depositMin", filter.depositMin);
  setNum("depositMax", filter.depositMax);
  setNum("rentMin", filter.rentMin);
  setNum("rentMax", filter.rentMax);
  for (const type of [...new Set(filter.roomTypes)].sort()) params.append("type", type);
  setStr("people", filter.people);
  setStr("gender", filter.gender);
  if (filter.sort !== DEFAULT_ROOM_SORT) params.set("sort", filter.sort);
  if (filter.page > 1) params.set("page", String(filter.page));

  return params.toString();
}

/**
 * RoomFilter → 도메인 조회 파라미터(RoomListQuery)
 *
 * FSD상 도메인은 features를 모르므로, features/filter-rooms가 이 변환을 소유합니다.
 * null·빈 배열은 undefined로 접어 "미지정"으로 넘깁니다.
 */
export function toRoomListQuery(filter: RoomFilter): RoomListQuery {
  return {
    page: filter.page,
    sort: filter.sort,
    keyword: filter.keyword ?? undefined,
    sido: filter.sido ?? undefined,
    sigungu: filter.sigungu ?? undefined,
    moveInDate: filter.moveInDate ?? undefined,
    minTerm: filter.minTerm ?? undefined,
    depositMin: filter.depositMin ?? undefined,
    depositMax: filter.depositMax ?? undefined,
    rentMin: filter.rentMin ?? undefined,
    rentMax: filter.rentMax ?? undefined,
    roomTypes: filter.roomTypes.length > 0 ? filter.roomTypes : undefined,
    people: filter.people ?? undefined,
    gender: filter.gender ?? undefined,
  };
}
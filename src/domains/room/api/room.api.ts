import { apiRequest } from "@/shared/api";

import type { RoomListResult, RoomSort } from "../model/room";
import { DEFAULT_ROOM_SORT } from "../model/room";
import type {
  ContractTerm,
  GenderPreference,
  OccupancyCount,
  RoomType,
} from "../model/room-options";
import { roomListResponseSchema } from "./room.dto";
import { toRoomListResult } from "./room.mapper";

/**
 * 매물 목록 조회 파라미터 (도메인이 소유하는 조회 계약)
 *
 * FSD상 도메인은 features를 import할 수 없으므로 features/filter-rooms의 `RoomFilter`를
 * 여기서 직접 받지 않습니다. features가 `RoomFilter` → 이 타입으로 매핑(`toRoomListQuery`)해
 * 호출합니다. 모든 필터 필드는 선택적이며, 미지정은 undefined입니다.
 */
export interface RoomListQuery {
  /** 공개 지역 정확 일치. 공개 지역이 없는 매물은 대략적 위치 부분 일치 */
  region?: string;
  /** 조회할 페이지 (1부터) */
  page: number;
  /** 정렬 — 미지정 시 최신순 */
  sort?: RoomSort;
  /** 입주 희망일 "YYYY-MM-DD" */
  moveInDate?: string;
  /** 최소 계약 기간 */
  minTerm?: ContractTerm;
  /** 보증금 최소·최대 (원) */
  depositMin?: number;
  depositMax?: number;
  /** 월세 최소·최대 (원) */
  rentMin?: number;
  rentMax?: number;
  /** 신규 건물 유형 (단일) */
  buildingType?: RoomType;
  /** 이용 인원 */
  people?: OccupancyCount;
  /** 선호 성별 (남성·여성 검색에는 성별 무관 매물도 포함) */
  gender?: GenderPreference;
}

/** 그리드 한 페이지 = 카드 8개 (설계 §2 스켈레톤 8개와 일치) */
const PAGE_SIZE = 8;

/** 우리 `minTerm` enum → API `minStayMonths`(숫자). 의미: "요청 기간 이하 최소거주" (백엔드 확인) */
const MIN_STAY_MONTHS: Record<ContractTerm, number> = {
  months1: 1,
  months3: 3,
  months6: 6,
  year1Plus: 12,
};

/** 화면 정렬 → API sortBy + order. */
const SORT_PARAM: Record<RoomSort, { sortBy?: string; order?: "ASC" | "DESC" }> = {
  latest: { sortBy: "createdAt", order: "DESC" },
  rentAsc: { sortBy: "monthlyRentKrw", order: "ASC" },
  depositAsc: { sortBy: "depositKrw", order: "ASC" },
  moveInAsc: { sortBy: "availableFrom", order: "ASC" },
};

/** 공개 목록 조회. 필터 금액은 원 단위이며 서버가 지원하는 조건만 전송합니다. */
export async function fetchRooms(
  query: RoomListQuery,
  signal?: AbortSignal,
): Promise<RoomListResult> {
  const { page, sort = DEFAULT_ROOM_SORT } = query;
  const sortParam = SORT_PARAM[sort];

  const dto = await apiRequest({
    path: "/rooms",
    schema: roomListResponseSchema,
    signal,
    searchParams: {
      region: query.region,
      page,
      limit: PAGE_SIZE,
      sortBy: sortParam.sortBy,
      order: sortParam.order,
      depositMin: query.depositMin,
      depositMax: query.depositMax,
      monthlyRentMin: query.rentMin,
      monthlyRentMax: query.rentMax,
      buildingType: query.buildingType,
      roomCapacity: query.people === "threePlus" ? "threeOrMore" : query.people,
      preferredGender: query.gender,
      minStayMonths: query.minTerm ? MIN_STAY_MONTHS[query.minTerm] : undefined,
      availableFrom: query.moveInDate,
    },
  });

  return toRoomListResult(dto);
}

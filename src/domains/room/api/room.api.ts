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
  /** 조회할 페이지 (1부터) */
  page: number;
  /** 정렬 — 미지정 시 추천순 */
  sort?: RoomSort;
  /** 검색어 (지역·동·지하철역) */
  keyword?: string;
  /** 시·도 코드 */
  sido?: string;
  /** 시·군·구 코드 */
  sigungu?: string;
  /** 입주 희망일 "YYYY-MM-DD" */
  moveInDate?: string;
  /** 최소 계약 기간 */
  minTerm?: ContractTerm;
  /** 보증금 최소·최대 (만원) */
  depositMin?: number;
  depositMax?: number;
  /** 월세 최소·최대 (만원) */
  rentMin?: number;
  rentMax?: number;
  /** 매물 유형 (다중) */
  roomTypes?: RoomType[];
  /** 이용 인원 */
  people?: OccupancyCount;
  /** 전용 성별 */
  gender?: GenderPreference;
}

/** 그리드 한 페이지 = 카드 8개 (설계 §2 스켈레톤 8개와 일치) */
const PAGE_SIZE = 8;
const KRW_PER_MANWON = 10_000;

/** 우리 `minTerm` enum → API `minStayMonths`(숫자). 의미: "요청 기간 이하 최소거주" (백엔드 확인) */
const MIN_STAY_MONTHS: Record<ContractTerm, number> = {
  months1: 1,
  months3: 3,
  months6: 6,
  year1Plus: 12,
};

/**
 * 우리 `sort` → API `sortBy` + `order`.
 *
 * API에는 "추천" 정렬이 없어 `recommended`는 기본값(createdAt DESC)으로 두어 파라미터를
 * 보내지 않습니다 — 현재 `latest`와 결과가 같습니다. 서버 추천 정렬이 생기면 여기만 바꿉니다.
 */
const SORT_PARAM: Record<RoomSort, { sortBy?: string; order?: "ASC" | "DESC" }> = {
  recommended: {},
  latest: { sortBy: "createdAt", order: "DESC" },
  rentAsc: { sortBy: "monthlyRentKrw", order: "ASC" },
  depositAsc: { sortBy: "depositKrw", order: "ASC" },
  moveInAsc: { sortBy: "availableFrom", order: "ASC" },
};

/** 만원 → 원. undefined는 그대로 통과(미지정). */
function toKrw(manwon: number | undefined): number | undefined {
  return manwon === undefined ? undefined : manwon * KRW_PER_MANWON;
}

/**
 * 매물 목록을 조회합니다. (`GET /rooms` — 공개 엔드포인트, 인증 불필요)
 *
 * 클라이언트(`"use client"` 위젯)에서만 호출되며, same-origin BFF 프록시(`/api/bff/rooms`)를
 * 거칩니다. 응답은 `roomListResponseSchema`로 검증된 뒤 매퍼가 도메인 모델로 바꿉니다.
 * SSR 프리페치를 쓰지 않는 이유: 사진이 만료되는 서명 URL이라, 서버에서 미리 받아 늦게
 * 하이드레이션하면 만료된 URL을 그릴 수 있습니다(설계 §2-5 — 하이드레이션 보류 결정).
 *
 * ⚠️ 스텁: 아래 4개 필터는 서버 계약이 없어 **전송하지 않습니다**(설계 §11 남은 질문).
 * URL·UI에는 남아 있지만 서버 필터링에는 반영되지 않습니다 — PR "가정한 값"에 명시.
 *   - keyword(q): 자유 검색 파라미터 없음 (API는 `region` 정확일치만 지원)
 *   - sido/sigungu: `region`은 "서울시 강남구" 같은 정확일치 문자열 — 유효 목록 확정 후
 *   - roomTypes: `roomType`/`propertyType`/`buildingType`/`rentalSpaceType` 단일 enum ×4
 *                (v1/v2 두 세대) — 타깃 필드·다중 허용 여부 확정 후
 *   - people: 대응 파라미터 없음
 */
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
      page,
      limit: PAGE_SIZE,
      sortBy: sortParam.sortBy,
      order: sortParam.order,
      depositMin: toKrw(query.depositMin),
      depositMax: toKrw(query.depositMax),
      monthlyRentMin: toKrw(query.rentMin),
      monthlyRentMax: toKrw(query.rentMax),
      preferredGender: query.gender,
      minStayMonths: query.minTerm ? MIN_STAY_MONTHS[query.minTerm] : undefined,
      availableFrom: query.moveInDate,
    },
  });

  return toRoomListResult(dto);
}
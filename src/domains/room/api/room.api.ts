import type { RoomListResult, RoomSort } from "../model/room";
import { DEFAULT_ROOM_SORT } from "../model/room";
import type {
  ContractTerm,
  GenderPreference,
  OccupancyCount,
  RoomType,
} from "../model/room-options";
import { MOCK_ROOM_DTOS } from "./mock-rooms";
import type { RoomDto } from "./room.dto";
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

const PAGE_SIZE = 8;
const KRW_PER_MANWON = 10_000;

function matchesKeyword(dto: RoomDto, keyword: string): boolean {
  const q = keyword.toLowerCase();
  return (
    dto.buildingName.toLowerCase().includes(q) ||
    dto.neighborhood.toLowerCase().includes(q) ||
    dto.transitSummary.toLowerCase().includes(q)
  );
}

/**
 * 목 필터링 — DTO에 필드가 있는 조건(검색어·월세·보증금)만 적용합니다.
 *
 * 유형·지역·계약기간·인원·성별은 목 DTO에 대응 필드가 없어 여기서 걸러지지 않습니다.
 * 다만 이 값들은 정규화된 쿼리 키에는 반영돼 캐시가 분리됩니다. 실제 API를 붙일 때는
 * 이 함수 대신 서버가 필터링하고, `fetchRooms` 본문만 교체됩니다(설계 §2-5).
 */
function applyMockFilter(dtos: readonly RoomDto[], query: RoomListQuery): RoomDto[] {
  return dtos.filter((dto) => {
    if (query.keyword && !matchesKeyword(dto, query.keyword)) return false;

    const rent = Math.round(dto.monthlyRentKrw / KRW_PER_MANWON);
    const deposit = Math.round(dto.depositKrw / KRW_PER_MANWON);
    if (query.rentMin !== undefined && rent < query.rentMin) return false;
    if (query.rentMax !== undefined && rent > query.rentMax) return false;
    if (query.depositMin !== undefined && deposit < query.depositMin) return false;
    if (query.depositMax !== undefined && deposit > query.depositMax) return false;

    return true;
  });
}

/** "YYYY-MM-DD" 문자열 비교 = 날짜 비교. 미정(null)은 뒤로 보냅니다. */
function compareMoveIn(a: string | null, b: string | null): number {
  if (a === b) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return a < b ? -1 : 1;
}

/**
 * 목 정렬 — DTO 필드로 표현 가능한 것만 실제로 재배열합니다.
 *
 * recommended·latest는 목 DTO에 등록일시가 없어 목 순서를 그대로 둡니다(실제 API에서
 * 정렬). rentAsc·depositAsc·moveInAsc는 즉시 확인 가능합니다.
 */
function applyMockSort(dtos: readonly RoomDto[], sort: RoomSort): RoomDto[] {
  const sorted = [...dtos];
  switch (sort) {
    case "rentAsc":
      sorted.sort((a, b) => a.monthlyRentKrw - b.monthlyRentKrw);
      break;
    case "depositAsc":
      sorted.sort((a, b) => a.depositKrw - b.depositKrw);
      break;
    case "moveInAsc":
      sorted.sort((a, b) => compareMoveIn(a.availableFrom, b.availableFrom));
      break;
    case "recommended":
    case "latest":
    default:
      break;
  }
  return sorted;
}

/**
 * 매물 목록을 조회합니다.
 *
 * 서버 컴포넌트·클라이언트 훅 양쪽에서 호출 가능한 시그니처입니다. 지금은 목 데이터를
 * 필터·정렬·페이지네이션하지만, 실제 API 응답과 동일한 경로(응답 스키마 `parse` → 매퍼)를
 * 통과시켜 두어 API 확정 시 이 함수 본문만 바꾸면 됩니다(설계 §2-5).
 */
export async function fetchRooms(query: RoomListQuery): Promise<RoomListResult> {
  const { page, sort = DEFAULT_ROOM_SORT } = query;

  const filtered = applyMockFilter(MOCK_ROOM_DTOS, query);
  const sorted = applyMockSort(filtered, sort);

  const start = (page - 1) * PAGE_SIZE;
  const pageItems = sorted.slice(start, start + PAGE_SIZE);

  const response = {
    rooms: pageItems,
    totalCount: sorted.length,
    page,
    hasNext: start + PAGE_SIZE < sorted.length,
  };

  // 서버 응답은 계약 위반을 오류로 드러내야 하므로 safeParse가 아닌 parse를 씁니다(설계 §6.0c).
  const dto = roomListResponseSchema.parse(response);
  return Promise.resolve(toRoomListResult(dto));
}
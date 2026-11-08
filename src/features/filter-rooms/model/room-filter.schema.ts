import { z } from "zod";

import { findSearchRegion, getSelectedRegion, SIDO_CODES, SIGUNGU_CODES } from "@/domains/region";
import {
  CONTRACT_TERMS,
  DEFAULT_ROOM_SORT,
  GENDER_PREFERENCES,
  ROOM_SORTS,
  ROOM_TYPES,
} from "@/domains/room";

import type { RoomFilter } from "./room-filter";

/**
 * URL searchParams → RoomFilter 파싱
 *
 * 핵심 규칙(설계 §2-4·§3.4): **필드마다 `.catch`**. 객체 스키마의 safeParse는 한 필드가
 * 깨지면 통째로 실패하므로, 날짜 하나의 오류가 지역까지 날려버립니다. 각 필드에
 * `.catch`를 붙이면 그 필드만 버리고 나머지는 살아남습니다.
 *
 * URL 파라미터명은 짧게(q·moveIn·term·type), RoomFilter 필드명은 서술적으로 두고
 * `parseRoomFilter`에서 매핑합니다. `.trim().min(1)`로 빈 문자열은 미지정 취급합니다.
 */
const optionalString = z.string().trim().min(1).optional().catch(undefined);

/** 같은 key 반복(type=a&type=b) 또는 단일 문자열을 배열로 정규화 */
function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string" && value.length > 0) return [value];
  return [];
}

const roomFilterParamsSchema = z.object({
  q: optionalString,
  // 화이트리스트(QA A): 구 URL `?sido=26`처럼 목록에 없는 지역 코드는 그 필드만 버립니다.
  // 그대로 두면 칩은 "지역"으로 보이는데 URL·isActive만 true인 유령 필터가 됩니다.
  sido: z.enum(SIDO_CODES).optional().catch(undefined),
  sigungu: z.enum(SIGUNGU_CODES).optional().catch(undefined),
  moveIn: z.iso.date().optional().catch(undefined),
  term: z.enum(CONTRACT_TERMS).optional().catch(undefined),
  // 잘못된 유형 값이 하나라도 섞이면 배열 전체를 비웁니다(그 필드만 버림).
  type: z.preprocess(toStringArray, z.array(z.enum(ROOM_TYPES)).max(1)).catch([]),
  gender: z.enum(GENDER_PREFERENCES).optional().catch(undefined),
  sort: z.enum(ROOM_SORTS).catch(DEFAULT_ROOM_SORT),
  page: z.coerce.number().int().positive().catch(1),
});

/**
 * 서버 컴포넌트(`app/rooms/page.tsx`)가 `await searchParams`한 결과를 넘깁니다.
 * 모든 필드에 `.catch`가 있어 safeParse는 사실상 항상 성공하지만, 방어적으로 실패 시
 * 빈 값으로 떨어뜨립니다.
 */
export function parseRoomFilter(
  searchParams: Record<string, string | string[] | undefined>,
): RoomFilter {
  const parsed = roomFilterParamsSchema.safeParse(searchParams);
  const data = parsed.success ? parsed.data : undefined;
  const searchedRegion = data?.q ? findSearchRegion(data.q) : undefined;

  return {
    keyword: searchedRegion ? null : (data?.q ?? null),
    sido: data?.sido ?? searchedRegion?.sido ?? null,
    sigungu: data?.sigungu ?? searchedRegion?.sigungu ?? null,
    moveInDate: data?.moveIn ?? null,
    minTerm: data?.term ?? null,
    roomTypes: data?.type ?? [],
    gender: data?.gender ?? null,
    sort: data?.sort ?? DEFAULT_ROOM_SORT,
    page: data?.page ?? 1,
  };
}

/** 유효하지 않은 공유 URL은 필터를 무시한 목록 대신 복구 안내를 보여줍니다. */
export function getRoomFilterIssues(
  params: Record<string, string | string[] | undefined>,
  filter: RoomFilter,
): string[] {
  const issues: string[] = [];
  if (Array.isArray(params.q)) issues.push("검색 지역은 하나만 선택해주세요.");
  if (filter.keyword)
    issues.push("현재 검색은 서울 자치구 선택을 지원합니다. 동·지하철역 검색은 준비 중입니다.");
  if ((params.sido || params.sigungu) && !getSelectedRegion(filter.sido, filter.sigungu)) {
    issues.push(
      "지역을 지원되는 서울 자치구로 다시 선택해주세요. 서울 전체·기타 지역은 아직 지원하지 않습니다.",
    );
  }
  const searched = typeof params.q === "string" ? findSearchRegion(params.q) : undefined;
  if (
    searched &&
    ((params.sido && params.sido !== searched.sido) ||
      (params.sigungu && params.sigungu !== searched.sigungu))
  ) {
    issues.push("검색어와 선택한 지역이 다릅니다. 검색 지역을 다시 선택해주세요.");
  }
  const types = toStringArray(params.type);
  if (types.length && !filter.roomTypes.length)
    issues.push(
      "건물 유형은 신규 5종 중 하나를 다시 선택해주세요. 이전 유형과 다중 선택은 지원하지 않습니다.",
    );
  const fields = {
    moveIn: filter.moveInDate,
    term: filter.minTerm,
    gender: filter.gender,
  };
  for (const [key, value] of Object.entries(fields)) {
    if (params[key] !== undefined && value === null)
      issues.push(
        "주소에 유효하지 않은 필터 값이 있습니다. 해당 조건을 다시 선택하거나 초기화해주세요.",
      );
  }
  return [...new Set(issues)];
}

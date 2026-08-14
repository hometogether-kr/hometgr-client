import { z } from "zod";

import {
  CONTRACT_TERMS,
  DEFAULT_ROOM_SORT,
  GENDER_PREFERENCES,
  OCCUPANCY_COUNTS,
  ROOM_SORTS,
  ROOM_TYPES,
} from "@/domains/room";

import type { RoomFilter } from "./room-filter";

/**
 * URL searchParams → RoomFilter 파싱
 *
 * 핵심 규칙(설계 §2-4·§3.4): **필드마다 `.catch`**. 객체 스키마의 safeParse는 한 필드가
 * 깨지면 통째로 실패하므로, `?rentMax=abc` 하나가 필터 전체를 날려버립니다. 각 필드에
 * `.catch`를 붙이면 그 필드만 버리고 나머지는 살아남습니다.
 *
 * URL 파라미터명은 짧게(q·moveIn·term·type), RoomFilter 필드명은 서술적으로 두고
 * `parseRoomFilter`에서 매핑합니다. `.trim().min(1)`로 빈 문자열은 미지정 취급합니다.
 */
const optionalString = z.string().trim().min(1).optional().catch(undefined);

/** 만원 단위 정수 금액. 음수·NaN("abc")은 버립니다(zod v4는 NaN을 number로 통과시키지 않음) */
const optionalAmount = z.coerce.number().int().nonnegative().optional().catch(undefined);

/** 같은 key 반복(type=a&type=b) 또는 단일 문자열을 배열로 정규화 */
function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string" && value.length > 0) return [value];
  return [];
}

const roomFilterParamsSchema = z.object({
  q: optionalString,
  sido: optionalString,
  sigungu: optionalString,
  moveIn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .catch(undefined),
  term: z.enum(CONTRACT_TERMS).optional().catch(undefined),
  depositMin: optionalAmount,
  depositMax: optionalAmount,
  rentMin: optionalAmount,
  rentMax: optionalAmount,
  // 잘못된 유형 값이 하나라도 섞이면 배열 전체를 비웁니다(그 필드만 버림).
  type: z.preprocess(toStringArray, z.array(z.enum(ROOM_TYPES))).catch([]),
  people: z.enum(OCCUPANCY_COUNTS).optional().catch(undefined),
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

  return {
    keyword: data?.q ?? null,
    sido: data?.sido ?? null,
    sigungu: data?.sigungu ?? null,
    moveInDate: data?.moveIn ?? null,
    minTerm: data?.term ?? null,
    depositMin: data?.depositMin ?? null,
    depositMax: data?.depositMax ?? null,
    rentMin: data?.rentMin ?? null,
    rentMax: data?.rentMax ?? null,
    roomTypes: data?.type ?? [],
    people: data?.people ?? null,
    gender: data?.gender ?? null,
    sort: data?.sort ?? DEFAULT_ROOM_SORT,
    page: data?.page ?? 1,
  };
}
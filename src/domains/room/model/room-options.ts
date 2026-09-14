/**
 * 매물 필터 선택지
 *
 * 필터 모달(B~D)이 쓰는 값·라벨을 한곳에 모읍니다. `listing-options.ts`와 같은 방식
 * (`as const` 배열 + 파생 유니온 + `Record<T, string>` 라벨 맵)을 따릅니다. `toOptions`
 * 헬퍼는 다른 도메인(`listing-draft`)에 있어 가져오지 않고 이 슬라이스에 다시 둡니다.
 *
 * 값은 설계 §5의 "피그마 확정값" 표를 그대로 옮긴 것입니다.
 */

export interface SelectOption<TValue extends string> {
  value: TValue;
  label: string;
}

function toOptions<TValue extends string>(
  values: readonly TValue[],
  labels: Record<TValue, string>,
): readonly SelectOption<TValue>[] {
  return values.map((value) => ({ value, label: labels[value] }));
}

/* 매물 유형 (다중 선택) */

export const ROOM_TYPES = [
  "apartment",
  "detachedHouse",
  "officetel",
  "twoRoom",
  "oneRoom",
] as const;
export type RoomType = (typeof ROOM_TYPES)[number];

export const ROOM_TYPE_LABEL: Record<RoomType, string> = {
  apartment: "아파트",
  detachedHouse: "단독 주택",
  officetel: "오피스텔",
  twoRoom: "투룸",
  oneRoom: "원룸",
};

export const ROOM_TYPE_OPTIONS = toOptions(ROOM_TYPES, ROOM_TYPE_LABEL);

// TODO(backend): 등록 플로우 BUILDING_TYPES(villa·apartment·detachedHouse·other)와
// 조회용 ROOM_TYPES의 매핑을 API 확정 시점에 맞춥니다 (설계 §11).

/* 최소 계약 기간 (단일 선택) */

export const CONTRACT_TERMS = ["months1", "months3", "months6", "year1Plus"] as const;
export type ContractTerm = (typeof CONTRACT_TERMS)[number];

export const CONTRACT_TERM_LABEL: Record<ContractTerm, string> = {
  months1: "1개월",
  months3: "3개월",
  months6: "6개월",
  year1Plus: "1년 이상",
};

export const CONTRACT_TERM_OPTIONS = toOptions(CONTRACT_TERMS, CONTRACT_TERM_LABEL);

/* 이용 인원 (단일 선택) */

export const OCCUPANCY_COUNTS = ["one", "two", "threePlus"] as const;
export type OccupancyCount = (typeof OCCUPANCY_COUNTS)[number];

export const OCCUPANCY_COUNT_LABEL: Record<OccupancyCount, string> = {
  one: "1명",
  two: "2명",
  threePlus: "3명 이상",
};

export const OCCUPANCY_COUNT_OPTIONS = toOptions(OCCUPANCY_COUNTS, OCCUPANCY_COUNT_LABEL);

/* 전용 성별 (단일 선택) */

export const GENDER_PREFERENCES = ["female", "male", "any"] as const;
export type GenderPreference = (typeof GENDER_PREFERENCES)[number];

export const GENDER_PREFERENCE_LABEL: Record<GenderPreference, string> = {
  female: "여성 전용",
  male: "남성 전용",
  any: "성별 무관",
};

export const GENDER_PREFERENCE_OPTIONS = toOptions(GENDER_PREFERENCES, GENDER_PREFERENCE_LABEL);

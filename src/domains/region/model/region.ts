/**
 * 지역(시·도 / 시·군·구) 트리
 *
 * 매물 필터의 지역 선택(B~D)이 쓰는 정적 데이터입니다. 설계 §11 결정에 따라 서울만
 * 시·군·구까지, 그 외 시·도는 시·도 단위까지만 둡니다. 코드는 행정표준코드를 따릅니다.
 */

export interface Sigungu {
  /** 시·군·구 코드 (예: "11680" 강남구) */
  code: string;
  name: string;
}

export interface Sido {
  /** 시·도 코드 (예: "11" 서울특별시) */
  code: string;
  name: string;
  /** 하위 시·군·구 — 서울 외에는 비어 있습니다 */
  sigungu: readonly Sigungu[];
}

export const SIDO_ETC = "etc";

export const SIDO_CODES = ["11", SIDO_ETC] as const;

export const SIGUNGU_CODES = [
  "11110",
  "11140",
  "11170",
  "11200",
  "11215",
  "11230",
  "11260",
  "11290",
  "11305",
  "11320",
  "11350",
  "11380",
  "11410",
  "11440",
  "11470",
  "11500",
  "11530",
  "11545",
  "11560",
  "11590",
  "11620",
  "11650",
  "11680",
  "11710",
  "11740",
] as const;

/** 시·도 코드로 시·도를 찾습니다. */
export function findSido(sidos: readonly Sido[], code: string): Sido | undefined {
  return sidos.find((sido) => sido.code === code);
}

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

/** 시·도 코드로 시·도를 찾습니다. */
export function findSido(sidos: readonly Sido[], code: string): Sido | undefined {
  return sidos.find((sido) => sido.code === code);
}

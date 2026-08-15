import { findSido, REGIONS } from "@/domains/region";
import { formatAmount, formatManwon } from "@/shared/lib/format-amount";

import type { RoomFilter } from "./room-filter";

/**
 * 칩 요약 라벨 헬퍼 (설계 §6.3 — 선택 시 카테고리명 대신 값 표시)
 *
 * 값 포맷(지역명 조회·금액 범위·날짜)은 features가 소유하고, 어떤 칩이 어떤 필드를
 * 참조하는지(칩 ↔ 필드 매핑)는 칩 바 위젯이 이 헬퍼들을 조합해 정합니다.
 */

/** 지역: "강남구" / "서울 전체" / null(미선택) */
export function regionChipLabel(filter: RoomFilter): string | null {
  if (filter.sido === null) return null;
  const sido = findSido(REGIONS, filter.sido);
  if (!sido) return null;
  if (filter.sigungu === null) return `${sido.name} 전체`;
  const sigungu = sido.sigungu.find((item) => item.code === filter.sigungu);
  return sigungu ? sigungu.name : `${sido.name} 전체`;
}

/**
 * 금액 범위 (입력·필터는 원 단위, 칩 표기는 만원으로 축약):
 * "500~1,000만원" / "500만원 이상" / "1,000만원 이하" / null
 *
 * 범위 양끝이 모두 있을 때 앞값은 단위 없이(`500~`) 뒤에서 한 번만 `만원`을 붙입니다.
 * 1만원 미만은 `formatManwon`이 원 그대로 떨어뜨립니다.
 */
export function amountRangeLabel(min: number | null, max: number | null): string | null {
  if (min !== null && max !== null) {
    return `${formatAmount(Math.round(min / 10_000))}~${formatManwon(max)}`;
  }
  if (min !== null) return `${formatManwon(min)} 이상`;
  if (max !== null) return `${formatManwon(max)} 이하`;
  return null;
}

/** 날짜: "2026.09.01" / null */
export function dateChipLabel(iso: string | null): string | null {
  if (!iso) return null;
  return iso.replace(/-/g, ".");
}
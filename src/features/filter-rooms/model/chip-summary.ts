import { findSido, REGIONS } from "@/domains/region";
import { formatAmount } from "@/shared/lib/format-amount";

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

/** 금액 범위: "1,000~2,000" / "1,000 이상" / "2,000 이하" / null */
export function amountRangeLabel(min: number | null, max: number | null): string | null {
  if (min !== null && max !== null) return `${formatAmount(min)}~${formatAmount(max)}`;
  if (min !== null) return `${formatAmount(min)} 이상`;
  if (max !== null) return `${formatAmount(max)} 이하`;
  return null;
}

/** 날짜: "2026.09.01" / null */
export function dateChipLabel(iso: string | null): string | null {
  if (!iso) return null;
  return iso.replace(/-/g, ".");
}
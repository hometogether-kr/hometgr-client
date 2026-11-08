import { formatAmount } from "@/shared/lib/format-amount";

/** 탐색 카드에는 보증금을 제외하고 원 단위 월세만 표시합니다. */
export function formatRoomPrice(monthlyRentKrw: number | null): string {
  if (monthlyRentKrw === null) return "가격 문의";
  return `월세 ${formatAmount(monthlyRentKrw)}원`;
}

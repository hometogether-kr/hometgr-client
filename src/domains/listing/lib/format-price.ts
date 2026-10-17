import { formatAmount } from "@/shared/lib/format-amount";

/** API의 원 단위 정수를 쉼표와 함께 표시합니다. */
export function formatPriceKrw(amountKrw: number | null): string {
  if (amountKrw === null) return "가격 문의";
  return `${formatAmount(amountKrw)}원`;
}

export function formatMonthlyRent(amountKrw: number | null): string {
  return formatPriceKrw(amountKrw);
}

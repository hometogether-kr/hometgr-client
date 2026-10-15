/** 원 단위 금액을 "1,000만원" 같은 만원 단위 표기로 바꿉니다. */
export function formatManwon(amountKrw: number | null): string {
  if (amountKrw === null) return "가격 문의";
  return `${Math.round(amountKrw / 10_000).toLocaleString("ko-KR")}만원`;
}

/** 공개 API의 월세는 만원 단위이므로 나누지 않고 표시합니다. */
export function formatMonthlyRent(amountManwon: number | null): string {
  if (amountManwon === null) return "가격 문의";
  return `${amountManwon.toLocaleString("ko-KR")}만원`;
}

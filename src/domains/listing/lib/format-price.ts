/** 원 단위 금액을 "1,000만원" 같은 만원 단위 표기로 바꿉니다. */
export function formatManwon(amountKrw: number): string {
  return `${Math.round(amountKrw / 10_000).toLocaleString("ko-KR")}만원`;
}

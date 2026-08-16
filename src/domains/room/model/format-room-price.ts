/**
 * 매물 가격 표기
 *
 * 보증금·월세(둘 다 만원 단위)를 카드 문구 `월세 1,000/80` 형태로 만듭니다.
 * 천 단위 콤마는 여기서 직접 처리합니다 — 공용 금액 포맷 유틸(`shared/lib/format-amount`)은
 * 금액 입력 필드와 함께 D(HOM-210)에서 도입되며, 그때 이 함수도 그 유틸을 쓰도록 정리합니다.
 */

/** 정수를 천 단위 콤마 문자열로 (`1000` → `"1,000"`). 로케일 의존 없이 동작합니다. */
function withThousandsSeparator(value: number): string {
  return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * @param deposit 보증금 (만원)
 * @param monthlyRent 월세 (만원)
 * @returns 예) `formatRoomPrice(1000, 80)` → `"월세 1,000/80"`
 */
export function formatRoomPrice(deposit: number, monthlyRent: number): string {
  return `월세 ${withThousandsSeparator(deposit)}/${withThousandsSeparator(monthlyRent)}`;
}

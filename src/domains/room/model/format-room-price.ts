/**
 * 매물 가격 표기
 *
 * 보증금·월세(둘 다 만원 단위)를 카드 문구 `월세 1,000/80` 형태로 만듭니다.
 * 천 단위 콤마는 여기서 직접 처리합니다 — 공용 금액 포맷 유틸(`shared/lib/format-amount`)은
 * 금액 입력 필드와 함께 D(HOM-210)에서 도입되며, 그때 이 함수도 그 유틸을 쓰도록 정리합니다.
 *
 * 서버가 금액을 null로 내려줄 수 있어(비공개·협의) null을 받습니다.
 */

/** 정수를 천 단위 콤마 문자열로 (`1000` → `"1,000"`). 로케일 의존 없이 동작합니다. */
function withThousandsSeparator(value: number): string {
  return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * @param deposit 보증금 (만원, 없으면 null)
 * @param monthlyRent 월세 (만원, 없으면 null)
 * @returns 예) `formatRoomPrice(1000, 80)` → `"월세 1,000/80"`.
 *          둘 다 null이면 `"가격 문의"`, 한쪽만 null이면 그 자리에 `"-"`.
 */
export function formatRoomPrice(deposit: number | null, monthlyRent: number | null): string {
  if (deposit === null && monthlyRent === null) return "가격 문의";
  const d = deposit === null ? "-" : withThousandsSeparator(deposit);
  const m = monthlyRent === null ? "-" : withThousandsSeparator(monthlyRent);
  return `월세 ${d}/${m}`;
}
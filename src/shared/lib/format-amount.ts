/**
 * 금액 표시 유틸 (만원 단위)
 *
 * `shared/lib`에 포맷 유틸이 없어 새로 둡니다(설계 §6.7). 가격 필터의 입력은 상태를
 * 숫자(number | null)로 들고, 화면에는 천 단위 콤마 문자열로 보여줍니다. 값은 만원 단위
 * 음이 아닌 정수만 다루므로 콤마·비숫자 문자를 모두 걷어내고 파싱합니다.
 */

/** 숫자 → 천 단위 콤마 문자열. null이면 빈 문자열. 예) 1000 → "1,000" */
export function formatAmount(value: number | null): string {
  if (value === null) return "";
  return value.toLocaleString("ko-KR");
}

/** 입력 문자열 → 숫자. 숫자가 하나도 없으면 null. 콤마·공백·단위 문자는 제거. */
export function parseAmount(raw: string): number | null {
  const digits = raw.replace(/[^\d]/g, "");
  if (digits === "") return null;
  return Number(digits);
}
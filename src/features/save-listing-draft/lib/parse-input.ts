/**
 * 화면 자유 입력 → API 값 변환
 *
 * 화면은 "65만원", "6개월"처럼 사람이 쓰는 표기를 받지만 API는 정수와 정규화된
 * 문자열을 요구합니다. 파싱 실패는 사용자 입력 문제이므로 예외 대신 null을 돌려주고,
 * 호출부가 필드 검증 메시지로 처리합니다.
 */

export { formatKoreanPhone } from "@/shared/lib/korean-phone";

const KRW_UNIT: Record<string, number> = {
  억: 100_000_000,
  만: 10_000,
  천: 1_000,
};

/** "65만원" · "650,000" · "1억5000만" → 원 단위 정수 */
export function parseKrwAmount(input: string): number | null {
  const normalized = input.replace(/[\s,원]/g, "");
  if (!normalized) return null;

  let total = 0;
  let matched = false;

  for (const match of normalized.matchAll(/(\d+(?:\.\d+)?)([억만천]?)/g)) {
    const [, amount, unit] = match;
    if (!amount) continue;

    matched = true;
    total += Number(amount) * (unit ? KRW_UNIT[unit] : 1);
  }

  return matched ? Math.round(total) : null;
}

/** "6개월" · "1년" · "1년 6개월" → 개월 수 */
export function parseStayMonths(input: string): number | null {
  const normalized = input.replace(/\s/g, "");
  if (!normalized) return null;

  const years = normalized.match(/(\d+)년/);
  const months = normalized.match(/(\d+)(?:개월|달)/);

  if (years || months) {
    return Number(years?.[1] ?? 0) * 12 + Number(months?.[1] ?? 0);
  }

  // 단위 없이 숫자만 적은 경우는 개월로 봅니다.
  return /^\d+$/.test(normalized) ? Number(normalized) : null;
}

/**
 * 한국 시간대(+09:00) 고정
 *
 * API가 시간대 suffix를 요구하는데, 국내 전용 서비스라 사용자 브라우저 시간대와
 * 무관하게 입주 가능일을 한국 날짜로 해석해야 합니다.
 */
const KST_OFFSET = "+09:00";

/** "2026-08-01" → "2026-08-01T00:00:00+09:00" */
export function toKstIsoString(date: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;

  const parsed = new Date(`${date}T00:00:00${KST_OFFSET}`);
  if (Number.isNaN(parsed.getTime())) return null;

  return `${date}T00:00:00${KST_OFFSET}`;
}

/** "2026-08-01T00:00:00+09:00" → "2026-08-01" (초안을 다시 열 때 입력란 복원용) */
export function toDateInputValue(isoString: string): string {
  return isoString.slice(0, 10);
}

/**
 * 도로명 주소에서 시·군·구 단위를 뽑습니다.
 *
 * 화면에 지역 입력란이 따로 없어 도로명 주소 앞부분으로 채웁니다. 주소 검색 API를
 * 붙이면 검색 결과의 지역 값을 그대로 쓰도록 바꿔야 합니다.
 */
export function deriveAddressRegion(addressRoad: string): string | undefined {
  const tokens = addressRoad.trim().split(/\s+/).filter(Boolean);
  if (tokens.length < 2) return undefined;

  return tokens.slice(0, 2).join(" ");
}

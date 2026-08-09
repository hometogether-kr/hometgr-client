/**
 * "010-1234-5678" · "+82 10-1234-5678" → "+821012345678"
 *
 * API가 13자 고정 길이를 요구하므로 국가번호를 붙인 E.164 형식으로 맞춥니다.
 */
export function formatKoreanPhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");

  const subscriberNumber = digits.startsWith("82")
    ? digits.slice(2)
    : digits.startsWith("0")
      ? digits.slice(1)
      : digits;

  // 국가번호를 뗀 휴대전화 번호는 10자리(10 1234 5678)여야 합니다.
  if (!/^10\d{8}$/.test(subscriberNumber)) return null;

  return `+82${subscriberNumber}`;
}

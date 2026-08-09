/** 약관 식별자 — 약관 전문 라우트의 slug로도 사용합니다. */
export type TermId =
  | "service"
  | "privacy"
  | "privacyThirdParty"
  | "location"
  | "alimtalk"
  | "econtract"
  | "paymentRefund"
  | "marketing";

export interface TermItem {
  id: TermId;
  label: string;
  required: boolean;
}

/**
 * Figma: 서비스 이용을 위해 동의가 필요해요 (643:19267 · 749:17279)
 *
 * TODO(consent): 백엔드가 피그마 terms 기준으로 consent 계약을 정리하면
 * privacyThirdParty 및 student 전용 필수 항목을 화면 정책에 맞게 다시 줄입니다.
 */
export const TERMS: readonly TermItem[] = [
  { id: "service", label: "서비스 이용약관", required: true },
  { id: "privacy", label: "개인정보 수집 및 이용 동의", required: true },
  { id: "privacyThirdParty", label: "개인정보 제3자 제공 동의", required: true },
  { id: "location", label: "위치기반 서비스 이용약관", required: true },
  { id: "alimtalk", label: "알림톡 수신 동의", required: true },
  { id: "econtract", label: "전자계약 이용 동의", required: true },
  { id: "paymentRefund", label: "결제 및 환불 정책 동의", required: true },
  {
    id: "marketing",
    label: "마케팅 정보 수신 및 개인정보 수집, 이용 동의",
    required: false,
  },
] as const;

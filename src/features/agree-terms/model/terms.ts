/** 약관 식별자 — 약관 전문 라우트의 slug로도 사용합니다. */
export type TermId = "service" | "privacy" | "location" | "marketing";

export interface TermItem {
  id: TermId;
  label: string;
  required: boolean;
}

/** Figma: 서비스 이용을 위해 동의가 필요해요 (643:19267 · 749:17279) */
export const TERMS: readonly TermItem[] = [
  { id: "service", label: "서비스 이용 약관", required: true },
  { id: "privacy", label: "개인정보 수집 및 이용 동의", required: true },
  { id: "location", label: "위치 기반 서비스 이용 약관", required: true },
  { id: "marketing", label: "마케팅 정보 수신 동의", required: false },
] as const;

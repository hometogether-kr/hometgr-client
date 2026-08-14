import type { ConsentKey, UserConsents } from "@/domains/user";

/** 약관 식별자 — 약관 전문 라우트의 slug로도 사용합니다. */
export type TermId = "service" | "privacy" | "location" | "marketing";

export type TermConsentKey = Extract<
  ConsentKey,
  "termsOfService" | "privacyCollection" | "locationBasedServiceTerms" | "marketingOptIn"
>;

export interface TermItem {
  id: TermId;
  key: TermConsentKey;
  label: string;
  required: boolean;
}

export const TERMS_POLICY_VERSION = "1.0.0";

/** Figma: 서비스 이용을 위해 동의가 필요해요 (643:19267 · 749:17279) */
export const TERMS: readonly TermItem[] = [
  {
    id: "service",
    key: "termsOfService",
    label: "홈투게더 서비스 이용약관",
    required: true,
  },
  {
    id: "privacy",
    key: "privacyCollection",
    label: "홈투게더 개인정보 처리방침",
    required: true,
  },
  {
    id: "location",
    key: "locationBasedServiceTerms",
    label: "홈투게더 위치기반 서비스 이용약관",
    required: true,
  },
  {
    id: "marketing",
    key: "marketingOptIn",
    label: "홈투게더 마케팅 정보 수신 및 개인정보 수집, 이용 동의서 (선택)",
    required: false,
  },
] as const;

export function getTermsWithConsentRequirements(
  consents: UserConsents | null | undefined,
): readonly TermItem[] {
  if (!consents) return TERMS;

  return TERMS.map((term) => {
    const consent = consents.items.find((item) => item.key === term.key);
    return consent ? { ...term, required: consent.required } : term;
  });
}

export function getAgreedTermIdsFromConsents(
  consents: UserConsents | null | undefined,
): readonly TermId[] {
  if (!consents) return [];

  return TERMS.filter((term) =>
    consents.items.some((item) => item.key === term.key && item.agreed),
  ).map((term) => term.id);
}

import { z } from "zod";

import type { TermId } from "./terms";
import { TERMS } from "./terms";

const STORAGE_KEY = "hometogether:onboarding:terms";

const termIdSchema = z.enum([
  "service",
  "privacy",
  "privacyThirdParty",
  "location",
  "alimtalk",
  "econtract",
  "paymentRefund",
  "marketing",
]);

const storedTermsAgreementSchema = z.object({
  agreedIds: z.array(termIdSchema),
});

type StoredTermsAgreement = z.infer<typeof storedTermsAgreementSchema>;

function readStoredAgreement(): StoredTermsAgreement | null {
  if (typeof window === "undefined") return null;

  const rawValue = window.sessionStorage.getItem(STORAGE_KEY);
  if (!rawValue) return null;

  try {
    const parsed = storedTermsAgreementSchema.safeParse(JSON.parse(rawValue) as unknown);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function saveOnboardingTermsAgreement(agreedIds: readonly TermId[]): void {
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ agreedIds }));
}

export function hasRequiredOnboardingTermsAgreement(): boolean {
  const stored = readStoredAgreement();
  if (!stored) return false;

  return TERMS.filter((term) => term.required).every((term) => stored.agreedIds.includes(term.id));
}

export function isOnboardingTermAgreed(termId: TermId): boolean {
  return readStoredAgreement()?.agreedIds.includes(termId) ?? false;
}

export function clearOnboardingTermsAgreement(): void {
  window.sessionStorage.removeItem(STORAGE_KEY);
}

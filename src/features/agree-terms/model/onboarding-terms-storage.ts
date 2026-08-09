import type { TermId } from "./terms";
import { TERMS } from "./terms";

const STORAGE_KEY = "hometogether:onboarding:terms";

interface StoredTermsAgreement {
  agreedIds: TermId[];
}

function readStoredAgreement(): StoredTermsAgreement | null {
  if (typeof window === "undefined") return null;

  const rawValue = window.sessionStorage.getItem(STORAGE_KEY);
  if (!rawValue) return null;

  try {
    const parsed = JSON.parse(rawValue) as Partial<StoredTermsAgreement>;
    return Array.isArray(parsed.agreedIds) ? { agreedIds: parsed.agreedIds } : null;
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

export function clearOnboardingTermsAgreement(): void {
  window.sessionStorage.removeItem(STORAGE_KEY);
}

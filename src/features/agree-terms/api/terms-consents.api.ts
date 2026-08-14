import { apiRequest } from "@/shared/api";

import { type TermConsentKey, type TermId, TERMS, TERMS_POLICY_VERSION } from "../model/terms";

export interface SubmitTermsConsentsInput {
  agreedIds: readonly TermId[];
}

export interface TermsConsentRequestItem {
  key: TermConsentKey;
  agreed: boolean;
  policyVersion: typeof TERMS_POLICY_VERSION;
}

export interface SubmitTermsConsentsBody {
  consents: {
    items: TermsConsentRequestItem[];
  };
}

export function toSubmitTermsConsentsBody({
  agreedIds,
}: SubmitTermsConsentsInput): SubmitTermsConsentsBody {
  const agreedIdSet = new Set(agreedIds);

  return {
    consents: {
      items: TERMS.map((term) => ({
        key: term.key,
        agreed: agreedIdSet.has(term.id),
        policyVersion: TERMS_POLICY_VERSION,
      })),
    },
  };
}

export async function submitTermsConsents(input: SubmitTermsConsentsInput): Promise<void> {
  await apiRequest({
    method: "PUT",
    path: "/me",
    body: toSubmitTermsConsentsBody(input),
  });
}

export const CONSENT_KEYS = [
  "termsOfService",
  "privacyCollection",
  "privacyThirdParty",
  "locationBasedServiceTerms",
  "roomPublication",
  "noFraudPledge",
  "alimtalkOptIn",
  "econtractAgreement",
  "careServiceMarketing",
  "marketingOptIn",
  "paymentRefundPolicy",
  "kakaoChannelOptIn",
] as const;

export type ConsentKey = (typeof CONSENT_KEYS)[number];

export interface ConsentStateItem {
  key: ConsentKey;
  agreed: boolean;
  policyVersion: string | null;
  required: boolean;
  agreedAt: string | null;
}

export interface UserConsents {
  items: readonly ConsentStateItem[];
  requiredSatisfied: boolean;
}

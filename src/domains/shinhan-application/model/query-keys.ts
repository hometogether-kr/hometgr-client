export const shinhanApplicationKeys = {
  consents: () => ["shinhan", "consents"] as const,
  consentDocument: () => ["shinhan", "consent-document"] as const,
  detail: (id: string | null) => ["shinhan", "application", id] as const,
};

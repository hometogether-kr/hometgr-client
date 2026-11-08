import { meResponseDtoSchema, type Session, toSession } from "@/domains/user";
import { ApiError, toApiError } from "@/shared/api";

import { completeOnboardingInputSchema } from "../model/onboarding-profile.schema";

const ONBOARDING_CONSENT_POLICY_VERSION = "1.0.0";

const CURRENT_CONSENT_ITEMS = [
  { key: "termsOfService", agreed: true },
  { key: "privacyCollection", agreed: true },
  { key: "locationBasedServiceTerms", agreed: true },
  { key: "marketingOptIn", agreed: false },
] as const;

export interface CompleteOnboardingInput {
  name: string;
  email: string;
  phone: string;
  marketingOptIn: boolean;
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function createRequiredConsents(marketingOptIn: boolean) {
  return {
    items: CURRENT_CONSENT_ITEMS.map(({ key, agreed }) => ({
      key,
      agreed: key === "marketingOptIn" ? marketingOptIn : agreed,
      policyVersion: ONBOARDING_CONSENT_POLICY_VERSION,
    })),
  };
}

export async function completeOnboarding(input: CompleteOnboardingInput): Promise<Session> {
  input = completeOnboardingInputSchema.parse(input);
  const response = await fetch("/api/auth/onboarding", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: input.name,
      email: input.email,
      phone: input.phone,
      consents: createRequiredConsents(input.marketingOptIn),
    }),
  });

  if (!response.ok) {
    throw toApiError(response.status, await readBody(response));
  }

  const parsed = meResponseDtoSchema.safeParse(await readBody(response));
  if (!parsed.success) {
    throw new ApiError("서버 응답 형식이 올바르지 않습니다.", {
      status: response.status,
      kind: "contract",
      cause: parsed.error,
    });
  }

  return toSession(parsed.data);
}

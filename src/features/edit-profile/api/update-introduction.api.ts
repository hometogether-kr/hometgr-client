import { z } from "zod";

import {
  type CurrentUser,
  meResponseDtoSchema,
  toSession,
  type UserConsents,
} from "@/domains/user";
import { ApiError, toApiError } from "@/shared/api";

const currentConsentKeys = [
  "termsOfService",
  "privacyCollection",
  "locationBasedServiceTerms",
  "marketingOptIn",
] as const;

const updateIntroductionInputSchema = z.object({
  introduction: z.string().trim().min(1, "소개를 입력해주세요.").max(1000),
});

export interface UpdateIntroductionInput {
  user: CurrentUser;
  consents: UserConsents;
  introduction: string;
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

function invalidProfile(message: string): never {
  throw new ApiError(message, { status: 400, kind: "validation" });
}

export async function updateIntroduction(input: UpdateIntroductionInput) {
  const parsed = updateIntroductionInputSchema.safeParse({
    introduction: input.introduction,
  });
  if (!parsed.success) invalidProfile(parsed.error.issues[0]?.message ?? "소개를 확인해주세요.");

  if (input.user.role !== "student" && input.user.role !== "host") {
    invalidProfile("일반 회원 프로필만 수정할 수 있습니다.");
  }
  if (!input.user.name || !input.user.email || !input.user.phone) {
    invalidProfile("기본 회원 정보를 확인할 수 없습니다.");
  }

  const consentByKey = new Map(input.consents.items.map((item) => [item.key, item]));
  const consents = currentConsentKeys.map((key) => ({
    key,
    agreed: key === "marketingOptIn" ? (consentByKey.get(key)?.agreed ?? false) : true,
    policyVersion: "1.0.0" as const,
  }));

  const response = await fetch("/api/auth/onboarding", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      role: input.user.role,
      name: input.user.name,
      email: input.user.email,
      phone: input.user.phone,
      introduction: parsed.data.introduction,
      consents: { items: consents },
    }),
  });

  if (!response.ok) throw toApiError(response.status, await readBody(response));

  const result = meResponseDtoSchema.safeParse(await readBody(response));
  if (!result.success) {
    throw new ApiError("서버 응답 형식이 올바르지 않습니다.", {
      status: response.status,
      kind: "contract",
      cause: result.error,
    });
  }

  return toSession(result.data);
}

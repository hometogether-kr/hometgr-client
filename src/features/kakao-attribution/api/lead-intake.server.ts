import "server-only";

import { z } from "zod";

import type { KakaoLeadIntake } from "../model/lead-intake";

const leadServiceEnvSchema = z.object({
  LEAD_SERVICE_BASE_URL: z.url(),
});

const leadServiceResponseSchema = z.object({
  leadId: z.uuid(),
  ok: z.literal(true),
});

type RemoteLeadSource = "KAKAO" | "EVERYTIME" | "INSTAGRAM" | "WEBSITE" | "ETC";

function toRemoteSource(source: KakaoLeadIntake["source"]): RemoteLeadSource {
  if (source === "instagram") return "INSTAGRAM";
  if (source === "everytime") return "EVERYTIME";
  if (source === "website") return "WEBSITE";
  if (source === "offline_qr") return "KAKAO";
  return "ETC";
}

function toCustomerType(purpose: KakaoLeadIntake["inquiryPurpose"]) {
  if (purpose === "FIND_ROOM") return "GUEST" as const;
  if (purpose === "LIST_ROOM") return "HOST" as const;
  return "UNKNOWN" as const;
}

function getLeadServiceUrl() {
  return leadServiceEnvSchema.parse({
    LEAD_SERVICE_BASE_URL: process.env.LEAD_SERVICE_BASE_URL,
  }).LEAD_SERVICE_BASE_URL;
}

export class LeadServiceUnavailableError extends Error {
  constructor() {
    super("LEAD_SERVICE_UNAVAILABLE");
    this.name = "LeadServiceUnavailableError";
  }
}

export async function createLeadBeforeKakaoChat(
  input: KakaoLeadIntake,
  forwardedFor: string | null,
): Promise<void> {
  const body = {
    budgetDeposit: input.budgetDeposit,
    budgetMonthly: input.budgetMonthly,
    customerTags: input.customerTags,
    customerType: toCustomerType(input.inquiryPurpose),
    desiredMoveIn: input.desiredMoveIn,
    desiredRegion: input.desiredRegion,
    desiredTermMonths: input.desiredTermMonths,
    mustHave: input.journeyIntent ? [...input.mustHave, input.journeyIntent] : input.mustHave,
    source: toRemoteSource(input.source),
    sourceDetail: [input.source, input.sourceCampaign].filter(Boolean).join(":"),
    utm: input.utm,
  };

  let response: Response;
  try {
    response = await fetch(new URL("/api/leads", getLeadServiceUrl()), {
      body: JSON.stringify(body),
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(forwardedFor ? { "X-Forwarded-For": forwardedFor } : {}),
      },
      method: "POST",
    });
  } catch {
    throw new LeadServiceUnavailableError();
  }

  if (!response.ok) throw new LeadServiceUnavailableError();
  const parsed = leadServiceResponseSchema.safeParse(await response.json().catch(() => null));
  if (!parsed.success) throw new LeadServiceUnavailableError();
}

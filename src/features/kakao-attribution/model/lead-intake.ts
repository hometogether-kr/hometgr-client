import { z } from "zod";

import type { MarketingSource } from "@/domains/marketing-attribution";

const customerTagSchema = z.enum([
  "UNIVERSITY_STUDENT",
  "GRADUATE_STUDENT",
  "TRANSFER_STUDENT",
  "GRADUATE",
  "RETAKER",
  "HIGH_SCHOOL_STUDENT",
  "INTERN",
  "EARLY_CAREER",
  "FOREIGNER",
  "OTHER",
]);

export const kakaoLeadIntakeSchema = z
  .object({
    budgetDeposit: z.number().int().min(0).max(1_000_000_000).optional(),
    budgetMonthly: z.number().int().min(0).max(100_000_000).optional(),
    customerTags: z.array(customerTagSchema).max(10),
    desiredMoveIn: z.iso.date().optional(),
    desiredRegion: z.string().trim().max(200).optional(),
    desiredTermMonths: z.number().int().min(1).max(120).optional(),
    inquiryPurpose: z.enum(["FIND_ROOM", "LIST_ROOM", "OTHER"]),
    journeyIntent: z
      .enum([
        "NOW_VIEWABLE_ROOM",
        "TODAY_OR_TOMORROW_VIEWING",
        "SCHOOL_OR_REGION_SEARCH",
        "SERVICE_GUIDE",
      ])
      .optional(),
    mustHave: z.array(z.string().trim().min(1).max(120)).max(20),
    source: z.enum(["instagram", "everytime", "daangn", "website", "offline_qr"]),
    sourceCampaign: z.string().trim().max(200).optional(),
    utm: z
      .object({
        campaign: z.string().trim().max(200).optional(),
        content: z.string().trim().max(200).optional(),
        medium: z.string().trim().max(200).optional(),
        source: z.string().trim().max(200).optional(),
        term: z.string().trim().max(200).optional(),
      })
      .optional(),
  })
  .strict();

export type KakaoLeadIntake = z.infer<typeof kakaoLeadIntakeSchema>;

export interface KakaoLeadIntakeFormValues {
  budgetDeposit: string;
  budgetMonthly: string;
  customerTags: string[];
  desiredMoveIn: string;
  desiredRegion: string;
  desiredTermMonths: string;
  inquiryPurpose: "FIND_ROOM" | "LIST_ROOM" | "OTHER";
  journeyIntent?: KakaoLeadIntake["journeyIntent"];
  mustHave: string[];
}

export const initialKakaoLeadIntakeFormValues: KakaoLeadIntakeFormValues = {
  budgetDeposit: "",
  budgetMonthly: "",
  customerTags: [],
  desiredMoveIn: "",
  desiredRegion: "",
  desiredTermMonths: "",
  inquiryPurpose: "FIND_ROOM",
  journeyIntent: undefined,
  mustHave: [],
};

function optionalInteger(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : undefined;
}

function optionalText(value: string): string | undefined {
  return value.trim() || undefined;
}

export function createKakaoLeadIntake(
  source: MarketingSource,
  sourceCampaign: string | undefined,
  values: KakaoLeadIntakeFormValues,
): KakaoLeadIntake {
  const currentUrl = new URL(window.location.href);

  return kakaoLeadIntakeSchema.parse({
    budgetDeposit: optionalInteger(values.budgetDeposit),
    budgetMonthly: optionalInteger(values.budgetMonthly),
    customerTags: values.customerTags,
    desiredMoveIn: values.desiredMoveIn || undefined,
    desiredRegion: optionalText(values.desiredRegion),
    desiredTermMonths: optionalInteger(values.desiredTermMonths),
    inquiryPurpose: values.inquiryPurpose,
    journeyIntent: values.journeyIntent,
    mustHave: values.mustHave,
    source,
    sourceCampaign,
    utm: {
      campaign: currentUrl.searchParams.get("utm_campaign") || undefined,
      content: currentUrl.searchParams.get("utm_content") || undefined,
      medium: currentUrl.searchParams.get("utm_medium") || undefined,
      source: currentUrl.searchParams.get("utm_source") || undefined,
      term: currentUrl.searchParams.get("utm_term") || undefined,
    },
  });
}

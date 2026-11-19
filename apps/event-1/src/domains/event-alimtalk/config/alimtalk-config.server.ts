import "server-only";

import { z } from "zod";

export const RECEIPT_TEMPLATE_CODE = "ht_event1_received";
export const RECEIPT_TEMPLATE_CONTENT =
  "[홈투게더] 한 달 월세 지원 이벤트\n\n신청이 접수되었습니다.\n신청 내용을 확인하고 있으니 잠시만 기다려 주세요.";

const credentialsSchema = z.object({
  NHN_ALIMTALK_APP_KEY: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9_-]+$/),
  NHN_ALIMTALK_SECRET_KEY: z
    .string()
    .trim()
    .min(1)
    .regex(/^[^\r\n]+$/),
  NHN_ALIMTALK_SENDER_KEY: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9_-]{40}$/),
  EVENT_ALIMTALK_TEMPLATE_CODE: z.literal(RECEIPT_TEMPLATE_CODE).default(RECEIPT_TEMPLATE_CODE),
});

export function getAlimtalkConfig() {
  // Approval and an explicit operator activation are both required before sending.
  if (process.env.EVENT_ALIMTALK_ENABLED !== "true") return null;
  const parsed = credentialsSchema.safeParse(process.env);
  if (!parsed.success) throw new Error("ALIMTALK_CONFIGURATION_INVALID");
  return parsed.data;
}

export type AlimtalkConfig = z.infer<typeof credentialsSchema>;

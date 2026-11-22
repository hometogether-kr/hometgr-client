import "server-only";

import { z } from "zod";

import {
  type AlimtalkConfig,
  RECEIPT_TEMPLATE_CODE,
  RECEIPT_TEMPLATE_CONTENT,
} from "../config/alimtalk-config.server";

const API_ORIGIN = "https://kakaotalk-bizmessage.api.nhncloudservice.com";
const headerSchema = z.object({ isSuccessful: z.boolean(), resultCode: z.number().int() });
const templateSchema = z.object({
  templateCode: z.string(),
  templateContent: z.string(),
  status: z.string(),
  block: z.boolean(),
  dormant: z.boolean(),
  buttons: z.array(z.unknown()).nullish(),
  quickReplies: z.array(z.unknown()).nullish(),
});
const templateResponseSchema = z.object({
  header: headerSchema,
  template: templateSchema.optional(),
  templates: templateSchema.optional(),
});
const sendResponseSchema = z.object({
  header: headerSchema,
  message: z
    .object({
      requestId: z.string().trim().min(1).max(500),
      sendResults: z
        .array(
          z.object({
            recipientNo: z.string().optional(),
            recipientSeq: z.number().int().min(0).max(2147483647).optional(),
            resultCode: z.number().int(),
          }),
        )
        .length(1),
    })
    .optional(),
});

export type NhnSendResult =
  | { state: "submitted"; requestId: string; recipientSeq: number }
  | { state: "rejected"; code: string; retryable: boolean }
  | { state: "unknown" };

function endpoint(config: AlimtalkConfig, path: string) {
  return `${API_ORIGIN}/alimtalk/v2.3/appkeys/${encodeURIComponent(config.NHN_ALIMTALK_APP_KEY)}${path}`;
}

export async function checkReceiptTemplate(config: AlimtalkConfig): Promise<string | null> {
  try {
    const response = await fetch(
      endpoint(
        config,
        `/senders/${encodeURIComponent(config.NHN_ALIMTALK_SENDER_KEY)}/templates/${RECEIPT_TEMPLATE_CODE}`,
      ),
      {
        redirect: "manual",
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
        headers: { "X-Secret-Key": config.NHN_ALIMTALK_SECRET_KEY },
      },
    );
    if (!response.ok) return "TEMPLATE_CHECK_UNAVAILABLE";
    const parsed = templateResponseSchema.safeParse(await response.json());
    if (!parsed.success || !parsed.data.header.isSuccessful) return "TEMPLATE_CHECK_UNAVAILABLE";
    const template = parsed.data.template ?? parsed.data.templates;
    if (!template) return "TEMPLATE_CHECK_UNAVAILABLE";
    if (template.status !== "TSC03" || template.block || template.dormant)
      return "TEMPLATE_NOT_APPROVED";
    if (
      template.templateCode !== RECEIPT_TEMPLATE_CODE ||
      template.templateContent.replace(/\r\n/g, "\n") !== RECEIPT_TEMPLATE_CONTENT ||
      template.buttons?.length ||
      template.quickReplies?.length
    )
      return "TEMPLATE_CONTENT_MISMATCH";
    return null;
  } catch {
    return "TEMPLATE_CHECK_UNAVAILABLE";
  }
}

export interface SendReceiptInput {
  phone: string;
  attemptId: string;
}

export async function sendReceipt(
  config: AlimtalkConfig,
  input: SendReceiptInput,
): Promise<NhnSendResult> {
  try {
    const response = await fetch(endpoint(config, "/messages"), {
      method: "POST",
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "X-Secret-Key": config.NHN_ALIMTALK_SECRET_KEY,
        "X-NC-API-IDEMPOTENCY-KEY": input.attemptId,
      },
      body: JSON.stringify({
        senderKey: config.NHN_ALIMTALK_SENDER_KEY,
        templateCode: RECEIPT_TEMPLATE_CODE,
        senderGroupingKey: input.attemptId,
        recipientList: [
          {
            recipientNo: input.phone,
            recipientGroupingKey: input.attemptId,
            resendParameter: { isResend: false },
          },
        ],
      }),
    });
    // NHN only deduplicates for ten minutes. An uncertain acceptance must not be retried.
    const parsed = sendResponseSchema.safeParse(await response.json());
    if (!parsed.success) return { state: "unknown" };
    const { header, message } = parsed.data;
    if (!header.isSuccessful)
      return {
        state: "rejected",
        code: `NHN_${header.resultCode}`,
        retryable: response.status === 429,
      };
    if (!response.ok || !message) return { state: "unknown" };
    const recipient = message.sendResults[0];
    if (recipient.recipientNo !== undefined && recipient.recipientNo !== input.phone)
      return { state: "unknown" };
    if (recipient.resultCode !== 0)
      return { state: "rejected", code: `NHN_${recipient.resultCode}`, retryable: false };
    if (recipient.recipientSeq === undefined) return { state: "unknown" };
    return {
      state: "submitted",
      requestId: message.requestId,
      recipientSeq: recipient.recipientSeq,
    };
  } catch {
    // Exceptions/provider bodies may include a phone number or credentials; never log them.
    return { state: "unknown" };
  }
}

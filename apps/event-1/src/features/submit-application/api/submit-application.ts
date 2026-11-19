import { z } from "zod";

import type { ApplicationInput } from "../model/application-input.schema";

const applicationReceiptSchema = z.object({
  applicationId: z.uuid(),
  status: z.literal("accepted"),
  receivedAt: z.iso.datetime(),
});

export interface ApplicationSubmission {
  key: string;
  input: ApplicationInput;
}

export type SubmissionResult =
  | { status: "accepted" }
  | { status: "rejected"; message: string }
  | { status: "closed" }
  | { status: "uncertain" };

export async function submitApplication(
  submission: ApplicationSubmission,
): Promise<SubmissionResult> {
  try {
    const response = await fetch("/event_1/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Idempotency-Key": submission.key },
      body: JSON.stringify(submission.input),
      signal: AbortSignal.timeout(15000),
      cache: "no-store",
    });
    if (response.status === 410) return { status: "closed" };
    if (response.status >= 500) return { status: "uncertain" };
    if (!response.ok) {
      return {
        status: "rejected",
        message: "접수하지 못했어요. 입력 내용을 확인하고 다시 신청해 주세요.",
      };
    }
    const receipt = applicationReceiptSchema.safeParse(await response.json());
    return receipt.success ? { status: "accepted" } : { status: "uncertain" };
  } catch {
    // A lost response may follow a successful save. Retrying must reuse this exact request.
    return { status: "uncertain" };
  }
}

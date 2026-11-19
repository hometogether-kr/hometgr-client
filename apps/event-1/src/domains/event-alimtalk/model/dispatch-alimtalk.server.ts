import "server-only";

import { randomUUID } from "node:crypto";
import { z } from "zod";

import { getEventDatabase } from "@/shared/api/database.server";

import { checkReceiptTemplate, sendReceipt } from "../api/nhn-alimtalk.server";
import { getAlimtalkConfig } from "../config/alimtalk-config.server";

const jobSchema = z.object({
  id: z.uuid(),
  phone: z.string().regex(/^\d{10,11}$/),
  attempts: z.number().int().min(1).max(3),
  lease_token: z.uuid(),
});

export interface DispatchOptions {
  applicationId?: string;
}

export async function dispatchAlimtalk(options: DispatchOptions = {}) {
  const config = getAlimtalkConfig();
  if (!config) return { state: "disabled", processed: 0 };
  const applicationId = z.uuid().optional().parse(options.applicationId);
  const blocked = await checkReceiptTemplate(config);
  if (blocked) return { state: blocked, processed: 0 };
  const database = getEventDatabase();
  // A terminated invocation may already have sent its request. Require manual reconciliation.
  await database.query(
    `UPDATE event_1.event_alimtalk_jobs
    SET status = 'FAILED', last_error_code = 'ACCEPTANCE_UNKNOWN', lease_token = NULL, updated_at = now()
    WHERE status = 'PROCESSING' AND updated_at < now() - interval '5 minutes'
      AND ($1::uuid IS NULL OR application_id = $1)`,
    [applicationId ?? null],
  );
  let processed = 0;
  const limit = applicationId ? 1 : 5;
  for (let index = 0; index < limit; index++) {
    const token = randomUUID();
    const claimed = await database.query(
      `WITH candidate AS (
      SELECT id FROM event_1.event_alimtalk_jobs
      WHERE status = 'PENDING' AND available_at <= now() AND attempts < 3
        AND ($1::uuid IS NULL OR application_id = $1)
      ORDER BY available_at, id FOR UPDATE SKIP LOCKED LIMIT 1
    ), claimed AS (
      UPDATE event_1.event_alimtalk_jobs j SET status = 'PROCESSING', attempts = attempts + 1,
        lease_token = $2, updated_at = now(), last_error_code = NULL
      FROM candidate WHERE j.id = candidate.id
      RETURNING j.id, j.application_id, j.attempts, j.lease_token
    ) SELECT c.id, c.attempts, c.lease_token, a.phone FROM claimed c
      JOIN event_1.event_applications a ON a.id = c.application_id`,
      [applicationId ?? null, token],
    );
    if (!claimed.rowCount) break;
    const job = jobSchema.parse(claimed.rows[0]);
    const result = await sendReceipt(config, {
      phone: job.phone,
      attemptId: `${job.id}_${job.attempts}`,
    });
    const retry = result.state === "rejected" && result.retryable && job.attempts < 3;
    const status = result.state === "submitted" ? "SUBMITTED" : retry ? "PENDING" : "FAILED";
    const errorCode =
      result.state === "unknown"
        ? "ACCEPTANCE_UNKNOWN"
        : result.state === "rejected"
          ? result.code
          : null;
    const updated = await database.query(
      `UPDATE event_1.event_alimtalk_jobs SET status = $3,
      provider_request_id = $4, provider_recipient_seq = $5, last_error_code = $6,
      available_at = now() + interval '5 minutes', lease_token = NULL, updated_at = now()
      WHERE id = $1 AND lease_token = $2 AND status = 'PROCESSING'`,
      [
        job.id,
        token,
        status,
        result.state === "submitted" ? result.requestId : null,
        result.state === "submitted" ? result.recipientSeq : null,
        errorCode,
      ],
    );
    if (updated.rowCount !== 1) throw new Error("ALIMTALK_JOB_LEASE_LOST");
    processed++;
  }
  return { state: "ready", processed };
}

export async function dispatchApplicationAlimtalk(applicationId: string) {
  try {
    return await dispatchAlimtalk({ applicationId });
  } catch {
    console.error("event_alimtalk_dispatch_failed");
    return { state: "unavailable", processed: 0 };
  }
}

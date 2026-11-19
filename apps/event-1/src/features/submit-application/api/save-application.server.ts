import "server-only";

import { createHash, randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import { z } from "zod";

import { getEventDatabase } from "@/shared/api/database.server";
import { getEventConfig } from "@/shared/config/event-env.server";

import type { ApplicationInput } from "../model/application-input.schema";
import { ApplicationError } from "./application-error";

const applicationRowSchema = z.object({
  id: z.uuid(),
  request_fingerprint: z.string(),
  created_at: z.date(),
});

async function findSubmission(client: PoolClient, submissionKey: string) {
  const result = await client.query<Record<string, unknown>>(
    "SELECT id, request_fingerprint, created_at FROM event_1.event_applications WHERE submission_key = $1",
    [submissionKey],
  );
  return result.rows[0] ? applicationRowSchema.parse(result.rows[0]) : undefined;
}

export async function saveApplication(input: ApplicationInput, submissionKey: string) {
  const config = getEventConfig();
  const fingerprint = createHash("sha256")
    .update(
      JSON.stringify({
        universityCampus: input.universityCampus,
        phone: input.phone,
        email: input.email,
        source: input.source ?? null,
      }),
    )
    .digest("hex");
  const client = await getEventDatabase().connect();
  let releaseError: Error | undefined;

  try {
    await client.query("BEGIN ISOLATION LEVEL READ COMMITTED");
    let application = await findSubmission(client, submissionKey);
    let replayed = Boolean(application);

    if (!application) {
      if (!config.intakeOpen || (config.closesAt && config.closesAt <= new Date())) {
        throw new ApplicationError("INTAKE_CLOSED");
      }
      const inserted = await client.query<Record<string, unknown>>(
        `INSERT INTO event_1.event_applications
          (id, submission_key, request_fingerprint, university_campus, phone, email, consent_version, source)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (submission_key) DO NOTHING
         RETURNING id, request_fingerprint, created_at`,
        [
          randomUUID(),
          submissionKey,
          fingerprint,
          input.universityCampus,
          input.phone,
          input.email,
          config.consentVersion,
          input.source ?? null,
        ],
      );
      if (inserted.rows[0]) {
        application = applicationRowSchema.parse(inserted.rows[0]);
        await client.query(
          `INSERT INTO event_1.event_alimtalk_jobs (id, application_id, kind)
           VALUES ($1, $2, 'APPLICATION_RECEIVED')`,
          [randomUUID(), application.id],
        );
      } else {
        // A concurrent request may have committed after the initial SELECT.
        application = await findSubmission(client, submissionKey);
        replayed = true;
      }
    }

    if (!application) throw new Error("Committed submission is missing");
    if (application.request_fingerprint !== fingerprint) {
      throw new ApplicationError("IDEMPOTENCY_CONFLICT");
    }
    await client.query("COMMIT");
    return {
      applicationId: application.id,
      receivedAt: application.created_at.toISOString(),
      replayed,
    };
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      releaseError = new Error("Event transaction rollback failed");
    }
    throw error;
  } finally {
    client.release(releaseError);
  }
}

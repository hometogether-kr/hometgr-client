import "server-only";

import { getEventConfig } from "@/shared/config/event-env.server";

import { applicationInputSchema, submissionKeySchema } from "../model/application-input.schema";
import { ApplicationError } from "./application-error";
import { saveApplication } from "./save-application.server";

const responseHeaders = { "Cache-Control": "private, no-store" };

function failure(code: string, status: number) {
  return Response.json({ code }, { status, headers: responseHeaders });
}

async function readApplicationBody(request: Request): Promise<unknown> {
  if (!request.body) return null;
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 4096) {
        await reader.cancel();
        throw new RangeError("Application body exceeds the size limit");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
}

export async function handleApplicationPost(request: Request) {
  try {
    if (request.headers.get("origin") !== getEventConfig().origin) {
      return failure("INVALID_ORIGIN", 403);
    }
    if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") {
      return failure("UNSUPPORTED_MEDIA_TYPE", 415);
    }
    const key = submissionKeySchema.safeParse(request.headers.get("idempotency-key"));
    if (!key.success) return failure("INVALID_SUBMISSION_KEY", 400);

    let body: unknown;
    try {
      body = await readApplicationBody(request);
    } catch (error) {
      if (error instanceof RangeError) return failure("PAYLOAD_TOO_LARGE", 413);
      return failure("INVALID_JSON", 400);
    }
    const input = applicationInputSchema.safeParse(body);
    if (!input.success) return failure("INVALID_INPUT", 400);

    const result = await saveApplication(input.data, key.data);
    return Response.json(
      {
        applicationId: result.applicationId,
        status: "accepted",
        receivedAt: result.receivedAt,
      },
      { status: result.replayed ? 200 : 201, headers: responseHeaders },
    );
  } catch (error) {
    if (error instanceof ApplicationError) {
      return failure(error.code, error.code === "INTAKE_CLOSED" ? 410 : 409);
    }
    const errorCode =
      error instanceof Error && "code" in error && typeof error.code === "string"
        ? error.code
        : error instanceof Error
          ? error.name
          : "UnknownError";
    console.error("event_application_save_failed", errorCode);
    return failure("SERVICE_UNAVAILABLE", 503);
  }
}

import "server-only";

import { z } from "zod";

import { shinhanErrorEnvelopeSchema } from "@/domains/shinhan-application";

import type { BridgeEnvironment } from "../config/environment.server";
import { BridgeFailure, unavailable } from "./errors.server";

export async function readBoundedJson(
  source: Request | Response,
  maximum: number,
): Promise<unknown> {
  const reader = source.body?.getReader();
  if (!reader) throw new BridgeFailure(400, "MALFORMED_JSON", "요청 형식을 확인해 주세요.");
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      length += part.value.byteLength;
      if (length > maximum) {
        await reader.cancel();
        throw new BridgeFailure(413, "PAYLOAD_TOO_LARGE", "입력 내용이 너무 깁니다.");
      }
      chunks.push(part.value);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
  } catch (error) {
    if (error instanceof BridgeFailure) throw error;
    throw new BridgeFailure(400, "MALFORMED_JSON", "요청 형식을 확인해 주세요.");
  } finally {
    reader.releaseLock();
  }
}

interface UpstreamInput {
  environment: BridgeEnvironment;
  path: string;
  method: string;
  expectedStatus: number;
  body?: unknown;
  token?: string;
  idempotencyKey?: string;
  clientKey?: string;
  sessionKey?: string;
}

export function upstreamContractVersion(path: string) {
  if (path === "sessions/bootstrap") return "1.1.0";
  if (path === "consents" || /^applications\/[0-9a-f-]+\/concerns$/i.test(path)) return "2.0.0";
  return "1.0.0";
}

const supportedErrorStatuses = new Set([400, 401, 403, 404, 405, 409, 413, 422, 429, 503]);

export async function requestUpstream<T>(input: UpstreamInput, schema: z.ZodType<T>) {
  const headers = new Headers({ "X-Shinhan-Bridge-Key": input.environment.SHINHAN_BRIDGE_SECRET });
  if (input.body !== undefined) headers.set("Content-Type", "application/json");
  if (input.token) headers.set("Authorization", `Bearer ${input.token}`);
  if (input.idempotencyKey) headers.set("Idempotency-Key", input.idempotencyKey);
  if (input.clientKey) headers.set("X-Shinhan-Client-Key", input.clientKey);
  if (input.sessionKey) headers.set("X-Shinhan-Session-Key", input.sessionKey);
  let response: Response;
  let body: unknown;
  try {
    response = await fetch(`${input.environment.SHINHAN_API_ORIGIN}/api/v1/${input.path}`, {
      method: input.method,
      headers,
      body: input.body === undefined ? undefined : JSON.stringify(input.body),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(10000),
    });
    if (
      response.headers.get("X-Contract-Version") !== upstreamContractVersion(input.path) ||
      response.headers.get("X-Shinhan-App-Env") !== input.environment.SHINHAN_APP_ENV ||
      !response.headers.get("Content-Type")?.toLowerCase().startsWith("application/json")
    )
      throw unavailable();
    body = await readBoundedJson(response, 256 * 1024);
  } catch {
    throw unavailable();
  }
  if (!response.ok) {
    const parsed = shinhanErrorEnvelopeSchema.safeParse(body);
    if (!parsed.success || !supportedErrorStatuses.has(response.status)) throw unavailable();
    const retryAfter = response.headers.get("Retry-After");
    throw new BridgeFailure(
      response.status,
      parsed.data.error.code,
      parsed.data.error.message,
      response.status === 429 && retryAfter && /^\d{1,6}$/.test(retryAfter)
        ? retryAfter
        : undefined,
      parsed.data,
    );
  }
  const parsed = schema.safeParse(body);
  if (response.status !== input.expectedStatus || !parsed.success) throw unavailable();
  return { body: parsed.data, replayed: response.headers.get("Idempotency-Replayed") === "true" };
}

import { z } from "zod";

import { ApiError, type ApiErrorKind } from "@/shared/api";

import { shinhanErrorEnvelopeSchema } from "./error.schema";

export interface ShinhanApiErrorOptions {
  status: number;
  kind: ApiErrorKind;
  code: string;
  fieldErrors?: Record<string, string[]>;
  retryAfter?: number | null;
  retryable: boolean;
  cause?: unknown;
}

export class ShinhanApiError extends ApiError {
  readonly fieldErrors: Record<string, string[]>;
  readonly retryAfter: number | null;
  readonly retryable: boolean;

  constructor(message: string, options: ShinhanApiErrorOptions) {
    super(message, options);
    this.name = "ShinhanApiError";
    this.fieldErrors = options.fieldErrors ?? {};
    this.retryAfter = options.retryAfter ?? null;
    this.retryable = options.retryable;
  }

  override get isRetryable(): boolean {
    return this.retryable;
  }
}

const errorMessages: Record<string, string> = {
  VALIDATION_ERROR: "입력값을 확인해 주세요.",
  SESSION_EXPIRED: "신청 세션이 만료되었습니다. 작성한 내용을 확인하고 새로 시작해 주세요.",
  UNAUTHENTICATED: "신청 세션을 먼저 준비해 주세요.",
  FORBIDDEN: "이 요청을 처리할 수 없습니다.",
  CSRF_INVALID: "요청 확인 정보가 만료되었습니다. 다시 준비해 주세요.",
  NOT_FOUND: "이 세션에서 신청 내역을 찾을 수 없습니다.",
  IDEMPOTENCY_CONFLICT: "이 요청의 내용이 이전 시도와 다릅니다. 제출 상태를 확인해 주세요.",
  INVALID_APPLICATION_TYPE: "이 신청에서 사용할 수 없는 기능입니다.",
  CONSENT_VERSION_MISMATCH: "개인정보 동의 내용이 변경되었습니다. 전문을 다시 확인해 주세요.",
  RATE_LIMITED: "요청이 잠시 많아졌습니다. 안내된 시간 후 다시 시도해 주세요.",
  PAYLOAD_TOO_LARGE: "입력 내용이 너무 깁니다. 내용을 확인해 주세요.",
  TEMPORARILY_UNAVAILABLE: "일시적으로 저장할 수 없습니다. 같은 내용으로 다시 시도해 주세요.",
  INTEGRATION_UNAVAILABLE: "신청 서버 연결이 준비되지 않았습니다. 잠시 후 다시 시도해 주세요.",
  UPSTREAM_UNAVAILABLE: "신청 서버에 연결하지 못했습니다. 같은 내용으로 다시 시도해 주세요.",
  INVALID_UPSTREAM_RESPONSE: "신청 서버 응답을 확인하지 못했습니다. 제출 상태를 확인해 주세요.",
};

function errorKind(status: number): ApiErrorKind {
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "notFound";
  if (status === 400 || status === 413 || status === 422) return "validation";
  if (status === 409) return "conflict";
  if (status >= 500) return "server";
  return "unknown";
}

function retryAfterSeconds(response: Response): number | null {
  const value = response.headers.get("Retry-After");
  if (value === null || !/^\d+$/.test(value)) return null;
  const seconds = Number(value);
  return Number.isSafeInteger(seconds) ? seconds : null;
}

function responseError(response: Response, body: unknown): ShinhanApiError {
  const parsed = shinhanErrorEnvelopeSchema.safeParse(body);
  const code = parsed.success ? parsed.data.error.code : "UNEXPECTED_RESPONSE";
  // A supplier or proxy's raw response must never become customer-facing copy.
  const message =
    errorMessages[code] ?? "요청을 완료하지 못했습니다. 잠시 후 상태를 확인해 주세요.";
  return new ShinhanApiError(message, {
    status: response.status,
    kind: errorKind(response.status),
    code,
    fieldErrors: parsed.success ? parsed.data.error.fieldErrors : undefined,
    retryAfter: retryAfterSeconds(response),
    retryable: response.status === 503 || response.status === 429,
  });
}

export interface ShinhanMutationCredentials {
  csrfToken: string;
  idempotencyKey: string;
}

export interface ShinhanRequestOptions<T> {
  path: string;
  method?: "GET" | "POST" | "PUT";
  body?: unknown;
  csrfToken?: string;
  idempotencyKey?: string;
  schema: z.ZodType<T>;
  expectedStatus: 200 | 201;
  signal?: AbortSignal;
}

export async function shinhanRequest<T>({
  path,
  method = "GET",
  body,
  csrfToken,
  idempotencyKey,
  schema,
  expectedStatus,
  signal,
}: ShinhanRequestOptions<T>): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (method !== "GET") {
    headers["Content-Type"] = "application/json";
    headers["X-Shinhan-CSRF"] = z.string().min(1).parse(csrfToken);
  }
  if (idempotencyKey !== undefined) headers["Idempotency-Key"] = z.uuid().parse(idempotencyKey);

  let response: Response;
  let rawBody: unknown;
  try {
    response = await fetch(`/api/shinhan${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: "same-origin",
      cache: "no-store",
      redirect: "error",
      signal,
    });
    const rawText = await response.text();
    try {
      rawBody = JSON.parse(rawText) as unknown;
    } catch {
      rawBody = undefined;
    }
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === "AbortError") throw cause;
    throw new ShinhanApiError(
      "연결이 끊겨 저장 결과를 확인하지 못했습니다. 같은 내용으로 다시 시도해 주세요.",
      {
        status: 0,
        kind: "network",
        code: "NETWORK_ERROR",
        retryable: true,
        cause,
      },
    );
  }

  if (!response.ok) throw responseError(response, rawBody);
  const parsed = schema.safeParse(rawBody);
  if (response.status !== expectedStatus || !parsed.success) {
    throw new ShinhanApiError("신청 응답을 확인하지 못했습니다. 제출 상태를 확인해 주세요.", {
      status: response.status,
      kind: "contract",
      code: "INVALID_RESPONSE",
      retryable: true,
    });
  }
  return parsed.data;
}

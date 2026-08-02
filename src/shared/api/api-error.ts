import { z } from "zod";

/** 서버 공통 오류 응답 (OpenAPI: HttpErrorResponseDto) */
export const httpErrorResponseDtoSchema = z.object({
  statusCode: z.number().int(),
  message: z.union([z.string(), z.array(z.string())]),
  error: z.string().optional(),
  path: z.string(),
  timestamp: z.string(),
});

export type HttpErrorResponseDto = z.infer<typeof httpErrorResponseDtoSchema>;

export type ApiErrorKind =
  /** 네트워크 단절·타임아웃 등 응답 자체를 받지 못한 경우 */
  | "network"
  /** 로그인이 필요하거나 세션이 만료된 경우 (401) */
  | "unauthorized"
  /** 권한이 없는 경우 (403) */
  | "forbidden"
  /** 대상을 찾을 수 없는 경우 (404) */
  | "notFound"
  /** 입력값 검증 실패 (400/422) */
  | "validation"
  /** 낙관적 잠금 충돌 등 상태 충돌 (409/410) */
  | "conflict"
  /** 서버 오류 (5xx) */
  | "server"
  /** 응답 본문이 계약과 다른 경우 */
  | "contract"
  | "unknown";

export interface ApiErrorOptions {
  status: number;
  kind: ApiErrorKind;
  /** 필드 단위 검증 메시지 — 서버가 배열로 내려준 경우 채워집니다. */
  details?: readonly string[];
  cause?: unknown;
}

/**
 * 앱 전체가 공유하는 오류 모델
 *
 * 컴포넌트와 훅이 `Response`, `status`, DTO 형태를 직접 다루지 않도록
 * 전송 계층 오류를 여기서 한 번만 정규화합니다.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly kind: ApiErrorKind;
  readonly details: readonly string[];

  constructor(message: string, { status, kind, details = [], cause }: ApiErrorOptions) {
    super(message, { cause });
    this.name = "ApiError";
    this.status = status;
    this.kind = kind;
    this.details = details;
  }

  get isUnauthorized(): boolean {
    return this.kind === "unauthorized";
  }

  /** 재시도해도 결과가 달라지지 않는 오류인지 — 쿼리 재시도 정책에 사용합니다. */
  get isRetryable(): boolean {
    return this.kind === "network" || this.kind === "server";
  }
}

function toErrorKind(status: number): ApiErrorKind {
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "notFound";
  if (status === 400 || status === 422) return "validation";
  if (status === 409 || status === 410) return "conflict";
  if (status >= 500) return "server";
  return "unknown";
}

const DEFAULT_MESSAGE: Partial<Record<ApiErrorKind, string>> = {
  network: "네트워크 연결을 확인해주세요.",
  unauthorized: "로그인이 필요합니다.",
  forbidden: "접근 권한이 없습니다.",
  notFound: "요청한 정보를 찾을 수 없습니다.",
  conflict: "다른 곳에서 먼저 변경되었습니다. 새로고침 후 다시 시도해주세요.",
  server: "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  contract: "서버 응답 형식이 올바르지 않습니다.",
  unknown: "요청을 처리하지 못했습니다.",
};

/**
 * 오류 응답 본문을 `ApiError`로 변환합니다.
 *
 * 서버가 계약과 다른 본문(HTML 오류 페이지 등)을 내려줄 수 있으므로
 * 파싱 실패를 정상 경로로 처리하고 상태 코드 기반 기본 메시지를 사용합니다.
 */
export function toApiError(status: number, rawBody: unknown): ApiError {
  const kind = toErrorKind(status);
  const parsed = httpErrorResponseDtoSchema.safeParse(rawBody);

  if (!parsed.success) {
    return new ApiError(DEFAULT_MESSAGE[kind] ?? "요청을 처리하지 못했습니다.", { status, kind });
  }

  const { message } = parsed.data;
  const details = Array.isArray(message) ? message : [];
  const primaryMessage = Array.isArray(message) ? message[0] : message;

  return new ApiError(primaryMessage || (DEFAULT_MESSAGE[kind] ?? "요청을 처리하지 못했습니다."), {
    status,
    kind,
    details,
  });
}

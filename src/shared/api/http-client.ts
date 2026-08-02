import type { z } from "zod";
import { ApiError, toApiError } from "./api-error";

/**
 * 브라우저는 API 서버를 직접 호출하지 않고 같은 origin의 BFF 프록시를 거칩니다.
 * 토큰은 httpOnly 쿠키에 있으므로 클라이언트 코드가 만질 일이 없습니다.
 */
export const BFF_PREFIX = "/api/bff";

export type QueryParamValue = string | number | boolean | readonly string[] | null | undefined;

export interface ApiRequestOptions<TResponse> {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** API 경로 — 예) `/host/rooms/drafts` */
  path: string;
  searchParams?: Record<string, QueryParamValue>;
  /** JSON 본문. `FormData`는 `formData`로 전달하세요. */
  body?: unknown;
  formData?: FormData;
  /** 응답 본문 스키마. 생략하면 본문을 읽지 않습니다(204 등). */
  schema?: z.ZodType<TResponse>;
  signal?: AbortSignal;
}

function buildUrl(path: string, searchParams?: Record<string, QueryParamValue>): string {
  const url = `${BFF_PREFIX}${path}`;
  if (!searchParams) return url;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value === null || value === undefined || value === "") continue;

    // 배열 파라미터는 같은 key를 반복합니다 (예: amenities=침대&amenities=책상)
    if (Array.isArray(value)) {
      for (const item of value) params.append(key, item);
      continue;
    }
    params.append(key, String(value));
  }

  const queryString = params.toString();
  return queryString ? `${url}?${queryString}` : url;
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

/**
 * 앱의 단일 HTTP 진입점
 *
 * 응답을 Zod로 검증한 뒤 반환하고, 실패는 모두 `ApiError`로 정규화합니다.
 * 호출자는 `Response`나 상태 코드를 직접 다루지 않습니다.
 */
export async function apiRequest<TResponse = void>({
  method = "GET",
  path,
  searchParams,
  body,
  formData,
  schema,
  signal,
}: ApiRequestOptions<TResponse>): Promise<TResponse> {
  let response: Response;

  try {
    response = await fetch(buildUrl(path, searchParams), {
      method,
      signal,
      // multipart는 boundary를 브라우저가 붙이도록 Content-Type을 지정하지 않습니다.
      headers: formData ? undefined : body === undefined ? undefined : { "Content-Type": "application/json" },
      body: formData ?? (body === undefined ? undefined : JSON.stringify(body)),
    });
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === "AbortError") throw cause;
    throw new ApiError("네트워크 연결을 확인해주세요.", { status: 0, kind: "network", cause });
  }

  if (!response.ok) {
    throw toApiError(response.status, await readBody(response));
  }

  if (!schema) return undefined as TResponse;

  const parsed = schema.safeParse(await readBody(response));
  if (!parsed.success) {
    throw new ApiError("서버 응답 형식이 올바르지 않습니다.", {
      status: response.status,
      kind: "contract",
      cause: parsed.error,
    });
  }

  return parsed.data;
}

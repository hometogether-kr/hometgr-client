import "server-only";

import { randomUUID } from "node:crypto";

import type { ShinhanErrorDto } from "@/domains/shinhan-application";

export class BridgeFailure extends Error {
  readonly body: ShinhanErrorDto;

  constructor(
    readonly status: number,
    code: string,
    message: string,
    readonly retryAfter?: string,
    body?: ShinhanErrorDto,
  ) {
    super(code);
    this.body = body ?? {
      error: { code, message, fieldErrors: {}, retryable: status === 429 || status >= 500 },
      requestId: randomUUID(),
    };
  }
}

export function unavailable() {
  return new BridgeFailure(
    503,
    "TEMPORARILY_UNAVAILABLE",
    "신청 서버에 연결할 수 없어요. 잠시 후 같은 요청으로 다시 시도해 주세요.",
  );
}

export function expiredSession() {
  return new BridgeFailure(
    401,
    "SESSION_EXPIRED",
    "접수 세션이 만료되었습니다. 접수 여부를 확인한 뒤 처음부터 시작해 주세요.",
  );
}

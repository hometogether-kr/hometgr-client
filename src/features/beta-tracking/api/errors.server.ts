import "server-only";

import {
  BETA_SCHEMA_VERSION,
  type BetaErrorCode,
  type BetaEventResponse,
} from "@/domains/beta-tracking";

const errorStatus: Record<BetaErrorCode, number> = {
  INVALID_JSON: 400,
  ORIGIN_REJECTED: 403,
  SIGNATURE_REJECTED: 403,
  TRACKING_DISABLED: 404,
  CONTEXT_MISMATCH: 409,
  EVENT_ID_CONFLICT: 409,
  SEMANTIC_CONFLICT: 409,
  ATTEMPT_CONFLICT: 409,
  MISSING_PREDECESSOR: 409,
  REPLAYED_ENVELOPE: 409,
  SIGNATURE_EXPIRED: 409,
  PAYLOAD_TOO_LARGE: 413,
  UNSUPPORTED_MEDIA_TYPE: 415,
  INVALID_EVENT: 422,
  UNSUPPORTED_VERSION: 422,
  RATE_LIMITED: 429,
  COLLECTOR_UNAVAILABLE: 503,
  INGRESS_UNAVAILABLE: 503,
};

const retryableCodes = new Set<BetaErrorCode>([
  "MISSING_PREDECESSOR",
  "REPLAYED_ENVELOPE",
  "SIGNATURE_EXPIRED",
  "RATE_LIMITED",
  "COLLECTOR_UNAVAILABLE",
  "INGRESS_UNAVAILABLE",
]);

export class BetaTrackingFailure extends Error {
  readonly status: number;
  readonly body: Extract<BetaEventResponse, { ok: false }>;

  constructor(code: BetaErrorCode, retryAfterMs?: number | null) {
    super(code);
    this.status = errorStatus[code];
    const retryable = retryableCodes.has(code);
    this.body = {
      ok: false,
      contract_version: BETA_SCHEMA_VERSION,
      error: {
        code,
        retryable,
        retry_after_ms: retryable ? (retryAfterMs ?? 1000) : null,
      },
    };
  }
}

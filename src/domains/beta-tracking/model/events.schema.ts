import { z } from "zod";

export const BETA_SCHEMA_VERSION = "0.1.0-draft.3";
export const BETA_MISSION_ID = "shinhan_existing_flow_mission_v1";
export const BETA_FLOW_IDS = [
  "HOST_ESTIMATE",
  "HOST_REGISTRATION",
  "GUEST_BUDGET",
  "GUEST_DEMAND",
] as const;

export type BetaFlowId = (typeof BETA_FLOW_IDS)[number];
export type BetaRole = "unselected" | "host" | "guest";

export const betaUuidSchema = z
  .string()
  .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);

export const betaTimestampSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
  .refine((value) => Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value);

export const betaContextIdSchema = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9][a-z0-9._-]*$/i);

export interface BetaTrackingContext {
  context_id: string;
  completion_basis: "simulation" | "saved_response";
}

export const betaTrackingContextSchema = z.strictObject({
  context_id: betaContextIdSchema,
  completion_basis: z.enum(["simulation", "saved_response"]),
});

const approvedAttributions = [
  ["apartment", "qr", "host_acq_2026q4", "ad_01"],
  ["kakao", "social", "host_acq_2026q4", "host"],
  ["everytime", "referral", "guest_acq_2026q4", "seoultech"],
  ["everytime", "referral", "guest_acq_2026q4", "union"],
  ["instagram", "social", "guest_acq_2026q4", "profile"],
  ["kakao", "social", "guest_acq_2026q4", "guest"],
  ["google", "organic", "", ""],
  ["naver", "organic", "", ""],
  ["", "", "", ""],
] as const;

export const betaEventInputSchema = z
  .strictObject({
    schema_version: z.literal(BETA_SCHEMA_VERSION),
    event_id: betaUuidSchema,
    attempt_id: betaUuidSchema,
    anonymous_id: betaUuidSchema,
    event_name: z.enum(["landing_view", "beta_mission_start", "beta_mission_complete"]),
    role: z.enum(["unselected", "host", "guest"]),
    occurred_at: betaTimestampSchema,
    utm_source: z.string().max(16),
    utm_medium: z.string().max(16),
    utm_campaign: z.string().max(32),
    utm_content: z.string().max(16),
    flow_id: z.enum(["", ...BETA_FLOW_IDS]),
    completion_basis: z.enum(["", "simulation", "saved_response"]),
  })
  .superRefine((event, context) => {
    const hasSelectedFlow =
      (event.role === "host" && event.flow_id.startsWith("HOST_")) ||
      (event.role === "guest" && event.flow_id.startsWith("GUEST_"));
    const isUnselectedEntry =
      event.event_name === "landing_view" && event.role === "unselected" && event.flow_id === "";
    if (!hasSelectedFlow && !isUnselectedEntry) {
      context.addIssue({ code: "custom", path: ["flow_id"], message: "Invalid role and flow." });
    }
    if ((event.event_name === "beta_mission_complete") !== (event.completion_basis !== "")) {
      context.addIssue({
        code: "custom",
        path: ["completion_basis"],
        message: "Invalid completion basis.",
      });
    }
    const tuple = [event.utm_source, event.utm_medium, event.utm_campaign, event.utm_content];
    if (
      !approvedAttributions.some((approved) => approved.every((value, i) => value === tuple[i]))
    ) {
      context.addIssue({
        code: "custom",
        path: ["utm_source"],
        message: "Unapproved attribution.",
      });
    }
  });

export type BetaEventInput = z.infer<typeof betaEventInputSchema>;

export const betaEventRequestSchema = z.strictObject({
  context_id: betaContextIdSchema,
  event: betaEventInputSchema,
});

export type BetaEventRequest = z.infer<typeof betaEventRequestSchema>;

export interface BetaCollectorInput extends BetaEventInput {
  run_id: string;
  dataset: "beta" | "connection_test";
  mission_id: typeof BETA_MISSION_ID;
}

export const BETA_ERROR_CODES = [
  "INVALID_JSON",
  "ORIGIN_REJECTED",
  "SIGNATURE_REJECTED",
  "TRACKING_DISABLED",
  "CONTEXT_MISMATCH",
  "EVENT_ID_CONFLICT",
  "SEMANTIC_CONFLICT",
  "ATTEMPT_CONFLICT",
  "MISSING_PREDECESSOR",
  "REPLAYED_ENVELOPE",
  "SIGNATURE_EXPIRED",
  "PAYLOAD_TOO_LARGE",
  "UNSUPPORTED_MEDIA_TYPE",
  "INVALID_EVENT",
  "UNSUPPORTED_VERSION",
  "RATE_LIMITED",
  "COLLECTOR_UNAVAILABLE",
  "INGRESS_UNAVAILABLE",
] as const;

export type BetaErrorCode = (typeof BETA_ERROR_CODES)[number];

const successSchema = z.strictObject({
  ok: z.literal(true),
  contract_version: z.literal(BETA_SCHEMA_VERSION),
  data: z.strictObject({
    status: z.enum(["accepted", "duplicate"]),
    request_event_id: betaUuidSchema,
    event_id: betaUuidSchema,
    received_at: betaTimestampSchema,
    projection_state: z.enum(["current", "dirty"]),
  }),
});

const failureSchema = z.strictObject({
  ok: z.literal(false),
  contract_version: z.literal(BETA_SCHEMA_VERSION),
  error: z
    .strictObject({
      code: z.enum(BETA_ERROR_CODES),
      retryable: z.boolean(),
      retry_after_ms: z.number().int().min(0).max(60_000).nullable(),
    })
    .refine((error) => {
      const retryable = [
        "MISSING_PREDECESSOR",
        "REPLAYED_ENVELOPE",
        "SIGNATURE_EXPIRED",
        "RATE_LIMITED",
        "COLLECTOR_UNAVAILABLE",
        "INGRESS_UNAVAILABLE",
      ].includes(error.code);
      return error.retryable === retryable && (retryable || error.retry_after_ms === null);
    }),
});

export const betaEventResponseSchema = z.discriminatedUnion("ok", [successSchema, failureSchema]);
export type BetaEventResponse = z.infer<typeof betaEventResponseSchema>;

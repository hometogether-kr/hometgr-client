import {
  type BetaEventRequest,
  betaEventRequestSchema,
  betaEventResponseSchema,
} from "@/domains/beta-tracking";

export type EventDeliveryResult =
  | { kind: "accepted" }
  | { kind: "permanent" }
  | { kind: "retry"; retryAfterMs: number; missingPredecessor: boolean };

export async function sendBetaEvent(input: BetaEventRequest): Promise<EventDeliveryResult> {
  const parsedRequest = betaEventRequestSchema.safeParse(input);
  if (!parsedRequest.success) return { kind: "permanent" };
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 1_500);
  try {
    const response = await fetch("/api/beta/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "omit",
      cache: "no-store",
      redirect: "error",
      signal: controller.signal,
      body: JSON.stringify(parsedRequest.data),
    });
    const body: unknown = await response.json();
    const parsed = betaEventResponseSchema.safeParse(body);
    if (!parsed.success) return { kind: "retry", retryAfterMs: 0, missingPredecessor: false };
    if (parsed.data.ok) {
      const result = parsed.data.data;
      const expectedStatus = result.status === "accepted" ? 201 : 200;
      if (
        response.status !== expectedStatus ||
        result.request_event_id !== input.event.event_id ||
        (result.status === "accepted" && result.event_id !== input.event.event_id)
      ) {
        return { kind: "retry", retryAfterMs: 0, missingPredecessor: false };
      }
      return { kind: "accepted" };
    }
    if (!parsed.data.error.retryable) return { kind: "permanent" };
    return {
      kind: "retry",
      retryAfterMs: parsed.data.error.retry_after_ms ?? 0,
      missingPredecessor: parsed.data.error.code === "MISSING_PREDECESSOR",
    };
  } catch {
    // A lost response may already have appended. Replay the same event ID/body.
    return { kind: "retry", retryAfterMs: 0, missingPredecessor: false };
  } finally {
    window.clearTimeout(timeout);
  }
}

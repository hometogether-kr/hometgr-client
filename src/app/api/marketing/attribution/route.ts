import { NextResponse } from "next/server";

import type { AttributionEventRecord } from "@/domains/marketing-attribution";
import {
  appendAttributionEventToGoogleSheet,
  attributionEventInputSchema,
} from "@/domains/marketing-attribution";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const METHOD_NOT_ALLOWED = () =>
  NextResponse.json({ error: "method_not_allowed" }, { headers: { Allow: "POST" }, status: 405 });

function logAttributionError(message: string, error: unknown) {
  // Do not log request bodies: query parameters can contain information outside
  // the intentionally minimal attribution payload.
  const detail = error instanceof Error ? error.message : String(error);
  console.error(`[marketing-attribution] ${message}: ${detail}`);
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = attributionEventInputSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { details: parsed.error.flatten(), error: "invalid_payload" },
      { status: 400 },
    );
  }

  const event: AttributionEventRecord = {
    ...parsed.data,
    // Use the server receipt time rather than browser-controlled event time.
    created_at: new Date().toISOString(),
  };

  try {
    await appendAttributionEventToGoogleSheet(event);
  } catch (error) {
    logAttributionError("Google Sheets append failed", error);
    return NextResponse.json({ error: "sheets_unavailable" }, { status: 502 });
  }

  return NextResponse.json({ event_id: event.event_id, ok: true }, { status: 201 });
}

export const DELETE = METHOD_NOT_ALLOWED;
export const GET = METHOD_NOT_ALLOWED;
export const PATCH = METHOD_NOT_ALLOWED;
export const PUT = METHOD_NOT_ALLOWED;

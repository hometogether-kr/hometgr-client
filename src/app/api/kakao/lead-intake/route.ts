import { NextResponse } from "next/server";

import {
  createLeadBeforeKakaoChat,
  LeadServiceUnavailableError,
} from "@/features/kakao-attribution/api";
import { kakaoLeadIntakeSchema } from "@/features/kakao-attribution/model/lead-intake";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function requestHasAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

export async function POST(request: Request) {
  if (!requestHasAllowedOrigin(request)) {
    return NextResponse.json({ error: "invalid_origin" }, { status: 403 });
  }
  if (Number(request.headers.get("content-length") ?? 0) > 16_384) {
    return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
  }

  const parsed = kakaoLeadIntakeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  try {
    await createLeadBeforeKakaoChat(parsed.data, request.headers.get("x-forwarded-for"));
  } catch (error) {
    if (!(error instanceof LeadServiceUnavailableError)) {
      console.error("[kakao-lead-intake] unexpected lead relay failure", error);
    }
    return NextResponse.json({ error: "lead_service_unavailable" }, { status: 503 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

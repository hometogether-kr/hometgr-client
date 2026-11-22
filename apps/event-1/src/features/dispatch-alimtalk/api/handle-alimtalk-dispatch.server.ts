import "server-only";

import { timingSafeEqual } from "node:crypto";
import { z } from "zod";

import { dispatchAlimtalk } from "@/domains/event-alimtalk";

const secretSchema = z.string().regex(/^[A-Za-z0-9_-]{32,128}$/);
const headers = { "Cache-Control": "private, no-store" };

export async function handleAlimtalkDispatch(request: Request) {
  const secret = secretSchema.safeParse(process.env.EVENT_ALIMTALK_DISPATCH_SECRET);
  if (!secret.success)
    return Response.json({ code: "SERVICE_UNAVAILABLE" }, { status: 503, headers });
  const expected = Buffer.from(`Bearer ${secret.data}`);
  const supplied = Buffer.from(request.headers.get("authorization") ?? "");
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied))
    return Response.json({ code: "UNAUTHORIZED" }, { status: 401, headers });
  try {
    return Response.json(await dispatchAlimtalk(), { headers });
  } catch {
    console.error("event_alimtalk_batch_failed");
    return Response.json({ code: "SERVICE_UNAVAILABLE" }, { status: 503, headers });
  }
}

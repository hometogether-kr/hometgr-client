import "server-only";

import type { NextRequest } from "next/server";

import { applicationPageQuerySchema, listEventApplications } from "@/domains/event-application";
import { getOperatorConfig, hasOperatorRequestSession } from "@/domains/event-operator";
const headers = { "Cache-Control": "private, no-store", Vary: "Cookie" };

export async function handleOpsApplicationsGet(request: NextRequest) {
  if (!getOperatorConfig())
    return Response.json({ code: "OPS_UNAVAILABLE" }, { status: 503, headers });
  if (!hasOperatorRequestSession(request))
    return Response.json({ code: "UNAUTHORIZED" }, { status: 401, headers });
  const parsed = applicationPageQuerySchema.safeParse({
    page: request.nextUrl.searchParams.get("page") ?? undefined,
  });
  if (!parsed.success) return Response.json({ code: "INVALID_PAGE" }, { status: 400, headers });
  try {
    return Response.json(await listEventApplications(parsed.data.page), { headers });
  } catch {
    console.error("event_ops_list_failed");
    return Response.json({ code: "TEMPORARILY_UNAVAILABLE" }, { status: 503, headers });
  }
}

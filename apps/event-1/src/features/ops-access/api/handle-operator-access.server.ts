import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";

import {
  createOperatorSession,
  getOperatorConfig,
  matchesOperatorPassword,
  operatorCookieName,
  operatorCookieOptions,
  operatorPasswordSchema,
} from "@/domains/event-operator";

const accessInputSchema = z.object({ accessKey: operatorPasswordSchema });
const privateHeaders = { "Cache-Control": "private, no-store" };

function redirectToOps(error?: string) {
  const response = new NextResponse(null, {
    status: 303,
    headers: {
      ...privateHeaders,
      Location: error ? `/event_1/ops?error=${error}` : "/event_1/ops",
    },
  });
  return response;
}

async function readAccessInput(request: Request) {
  if (
    !request.body ||
    request.headers.get("content-type")?.split(";")[0] !== "application/x-www-form-urlencoded"
  )
    return null;
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 2048) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
    return Object.fromEntries(new URLSearchParams(Buffer.concat(chunks).toString("utf8")));
  } finally {
    reader.releaseLock();
  }
}

export async function handleOperatorSignIn(request: Request) {
  const config = getOperatorConfig();
  if (!config)
    return Response.json({ code: "OPS_UNAVAILABLE" }, { status: 503, headers: privateHeaders });
  if (request.headers.get("origin") !== config.origin)
    return Response.json({ code: "INVALID_ORIGIN" }, { status: 403, headers: privateHeaders });
  let input: unknown;
  try {
    input = await readAccessInput(request);
  } catch {
    return redirectToOps("invalid");
  }
  const parsed = accessInputSchema.safeParse(input);
  if (!parsed.success || !matchesOperatorPassword(parsed.data.accessKey))
    return redirectToOps("invalid");
  const response = redirectToOps();
  response.cookies.set(operatorCookieName, createOperatorSession(), operatorCookieOptions());
  return response;
}

export function handleOperatorSignOut(request: Request) {
  const config = getOperatorConfig();
  if (!config || request.headers.get("origin") !== config.origin)
    return Response.json({ code: "INVALID_ORIGIN" }, { status: 403, headers: privateHeaders });
  const response = redirectToOps();
  response.cookies.set(operatorCookieName, "", { ...operatorCookieOptions(), maxAge: 0 });
  return response;
}

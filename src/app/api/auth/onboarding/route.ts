import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { meResponseDtoSchema, putMeResponseDtoSchema } from "@/domains/user";
import {
  backendFetch,
  clearSessionTokens,
  readSessionTokens,
  refreshTokenPair,
  writeSessionTokens,
} from "@/shared/api/server";

const consentItemSchema = z.object({
  // TODO(consent): 백엔드 consent 계약이 피그마 terms 기준으로 정리되면 허용 key도 축소합니다.
  key: z.enum([
    "termsOfService",
    "privacyCollection",
    "privacyThirdParty",
    "locationBasedServiceTerms",
    "alimtalkOptIn",
    "econtractAgreement",
    "paymentRefundPolicy",
  ]),
  agreed: z.boolean(),
  policyVersion: z.literal("1.0.0"),
});

const onboardingRequestSchema = z.object({
  role: z.enum(["student", "host"]),
  name: z.string().trim().min(1).max(100),
  email: z.email().max(320),
  phone: z.string().trim().min(1),
  consents: z.object({
    items: z.array(consentItemSchema).min(1),
  }),
});

function errorResponse(status: number, message: string, path: string): NextResponse {
  return NextResponse.json(
    { statusCode: status, message, path, timestamp: new Date().toISOString() },
    { status },
  );
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

async function readJsonRequest(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function putMe(body: unknown, accessToken?: string): Promise<Response> {
  return backendFetch("/me", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    accessToken,
  });
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  const parsed = onboardingRequestSchema.safeParse(await readJsonRequest(request));
  if (!parsed.success) {
    return errorResponse(400, "가입 정보를 확인해주세요.", request.nextUrl.pathname);
  }

  const { accessToken, refreshToken } = await readSessionTokens();

  let response: Response;
  try {
    response = await putMe(parsed.data, accessToken);
  } catch {
    return errorResponse(502, "API 서버에 연결하지 못했습니다.", request.nextUrl.pathname);
  }

  if (response.status === 401 && refreshToken) {
    const renewed = await refreshTokenPair(refreshToken);
    if (!renewed) {
      await clearSessionTokens();
      return errorResponse(401, "로그인이 필요합니다.", request.nextUrl.pathname);
    }

    await writeSessionTokens(renewed);
    try {
      response = await putMe(parsed.data, renewed.accessToken);
    } catch {
      return errorResponse(502, "API 서버에 연결하지 못했습니다.", request.nextUrl.pathname);
    }
  }

  if (!response.ok) {
    const body = await readBody(response);
    return typeof body === "object" && body !== null
      ? NextResponse.json(body, { status: response.status })
      : errorResponse(response.status, "가입을 완료하지 못했습니다.", request.nextUrl.pathname);
  }

  const result = putMeResponseDtoSchema.safeParse(await readBody(response));
  if (!result.success) {
    return errorResponse(502, "API 응답 형식이 올바르지 않습니다.", request.nextUrl.pathname);
  }

  const { accessToken: nextAccessToken, refreshToken: nextRefreshToken, ...session } = result.data;
  await writeSessionTokens({ accessToken: nextAccessToken, refreshToken: nextRefreshToken });

  return NextResponse.json(meResponseDtoSchema.parse(session), {
    headers: { "Cache-Control": "no-store", Pragma: "no-cache" },
  });
}

import { type NextRequest, NextResponse } from "next/server";

import {
  backendFetch,
  clearSessionTokensFromResponse,
  readSessionTokens,
  refreshTokenPair,
  writeSessionTokensToResponse,
} from "@/shared/api/server";
import { getServerEnv } from "@/shared/config/env.server";

interface ProxyContext {
  params: Promise<{ path: string[] }>;
}

/** 브라우저 요청에서 API 서버로 넘길 헤더만 골라냅니다. 세션 쿠키는 넘기지 않습니다. */
const FORWARDED_REQUEST_HEADERS = ["content-type", "accept", "accept-language"];

/**
 * 응답에서 제외할 헤더
 *
 * 본문은 undici가 이미 압축을 풀어 전달하므로 인코딩·길이 헤더를 그대로 넘기면
 * 브라우저가 본문을 해석하지 못합니다. 백엔드 쿠키도 우리 도메인에 심지 않습니다.
 */
const STRIPPED_RESPONSE_HEADERS = new Set([
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "connection",
  "set-cookie",
]);

function pickRequestHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {};

  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers[name] = value;
  }

  return headers;
}

function toClientResponse(response: Response): NextResponse {
  const headers = new Headers();

  response.headers.forEach((value, name) => {
    if (!STRIPPED_RESPONSE_HEADERS.has(name.toLowerCase())) headers.set(name, value);
  });

  return new NextResponse(response.body, { status: response.status, headers });
}

/**
 * 인증 프록시
 *
 * 브라우저는 `/api/bff/<API 경로>`만 호출하고, 여기서 httpOnly 쿠키의 access token을
 * Authorization 헤더로 바꿔 붙입니다. 토큰이 브라우저 JavaScript에 노출되지 않습니다.
 *
 * 401이면 refresh token으로 한 번만 재발급하고 같은 요청을 재시도합니다. 재발급까지
 * 실패하면 세션을 지워 다음 요청이 로그인부터 다시 시작하도록 합니다.
 */
function errorResponse(status: number, message: string, path: string): NextResponse {
  return NextResponse.json(
    { statusCode: status, message, path, timestamp: new Date().toISOString() },
    { status },
  );
}

async function proxy(request: NextRequest, context: ProxyContext): Promise<NextResponse> {
  const { path } = await context.params;
  const targetPath = `/${path.join("/")}${request.nextUrl.search}`;

  /*
   * 환경 변수 오류와 네트워크 오류를 구분합니다. 둘 다 502로 뭉뚱그리면
   * .env를 안 만든 상황이 "API 서버가 죽었다"로 보여 원인 찾기가 어려워집니다.
   */
  try {
    getServerEnv();
  } catch {
    return errorResponse(
      500,
      "API_BASE_URL 환경 변수가 설정되지 않았습니다. .env.example을 .env.local로 복사해 값을 채워주세요.",
      targetPath,
    );
  }

  const { accessToken, refreshToken } = await readSessionTokens();
  const headers = pickRequestHeaders(request);

  /*
   * 401 재시도에 같은 본문을 다시 써야 하므로 스트림 대신 버퍼로 읽습니다.
   * 업로드 상한이 파일당 10 MiB로 제한되어 있어 메모리에 담아도 안전합니다.
   */
  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const body = hasBody ? await request.arrayBuffer() : undefined;

  let response: Response;
  try {
    response = await backendFetch(targetPath, {
      method: request.method,
      headers,
      body,
      accessToken,
    });
  } catch {
    return errorResponse(502, "API 서버에 연결하지 못했습니다.", targetPath);
  }

  if (response.status !== 401 || !refreshToken) return toClientResponse(response);

  const renewed = await refreshTokenPair(refreshToken);
  if (!renewed) {
    const clientResponse = toClientResponse(response);
    clearSessionTokensFromResponse(clientResponse);
    return clientResponse;
  }

  try {
    const retried = await backendFetch(targetPath, {
      method: request.method,
      headers,
      body,
      accessToken: renewed.accessToken,
    });
    const clientResponse = toClientResponse(retried);
    writeSessionTokensToResponse(clientResponse, renewed);
    return clientResponse;
  } catch {
    return toClientResponse(response);
  }
}

export { proxy as DELETE, proxy as GET, proxy as PATCH, proxy as POST, proxy as PUT };

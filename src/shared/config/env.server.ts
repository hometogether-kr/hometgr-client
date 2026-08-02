import { z } from "zod";

/**
 * 서버 전용 환경 변수
 *
 * BFF Route Handler에서만 사용합니다. 클라이언트 번들에 들어가면 안 되므로
 * `NEXT_PUBLIC_` 접두사를 붙이지 않습니다.
 */
const serverEnvSchema = z.object({
  /** NestJS API 서버 origin — 예) https://api.hometogether.example */
  API_BASE_URL: z.url(),
  /**
   * 이 Next.js 앱의 origin — 카카오 콜백 이후 절대 URL redirect에 사용합니다.
   * 예) http://localhost:3000
   */
  APP_BASE_URL: z.url(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cachedEnv: ServerEnv | null = null;

/**
 * 잘못된 환경 변수는 프로그래머·배포 설정 오류이므로 `parse`로 즉시 중단합니다.
 * 매 요청마다 검증하지 않도록 첫 호출 결과를 재사용합니다.
 */
export function getServerEnv(): ServerEnv {
  cachedEnv ??= serverEnvSchema.parse({
    API_BASE_URL: process.env.API_BASE_URL,
    APP_BASE_URL: process.env.APP_BASE_URL,
  });

  return cachedEnv;
}

import { z } from "zod";

export const AUTH_RETURN_TO_COOKIE = "ht_auth_return_to";

const authReturnPathSchema = z
  .string()
  .max(2048)
  .refine((path) => {
    if (!path.startsWith("/") || path.startsWith("//") || /[\\\u0000-\u0020]/.test(path))
      return false;
    const url = new URL(path, "https://app.invalid");
    return (
      url.origin === "https://app.invalid" &&
      !/^\/(?:auth|login|onboarding)(?:\/|$)/.test(url.pathname)
    );
  });

/** 외부 URL과 인증 화면 순환을 막고 앱 내부 복귀 경로만 허용합니다. */
export function parseAuthReturnPath(value: unknown): string | null {
  const parsed = authReturnPathSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

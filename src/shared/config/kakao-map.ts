import { z } from "zod";

const kakaoMapKeySchema = z.string().trim().min(1);

export function getKakaoMapJavaScriptKey(): string | undefined {
  const parsed = kakaoMapKeySchema.safeParse(
    process.env.NEXT_PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY ||
      process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY,
  );
  return parsed.success ? parsed.data : undefined;
}

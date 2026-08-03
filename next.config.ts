import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  /**
   * 카카오 콜백 경로 호환
   *
   * BFF 핸들러는 `/api/auth/kakao/callback`에 있지만, API 서버에 등록된 카카오
   * redirect URI는 백엔드 시절 경로인 `/auth/kakao/callback`을 그대로 쓰고 있습니다.
   * 토큰 교환은 인증을 시작할 때 쓴 redirect URI와 같은 값을 요구해서 프론트가
   * 주소를 바꿔 받을 수 없으므로, 그 경로를 핸들러로 이어 붙입니다.
   *
   * 백엔드가 redirect URI를 `/api/auth/kakao/callback`으로 바꾸면 삭제하세요.
   */
  async rewrites() {
    return [
      {
        source: "/auth/kakao/callback",
        destination: "/api/auth/kakao/callback",
      },
    ];
  },
};

export default nextConfig;

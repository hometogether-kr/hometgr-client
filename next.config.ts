import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    /*
     * 매물 사진은 API가 내려주는 S3 서명 URL(만료 있음)입니다.
     * 예) https://hometogether-dev-media.s3.ap-northeast-2.amazonaws.com/room-media/*.jpg
     * dev·prod 버킷 이름이 달라 서브도메인 한 칸을 와일드카드로 둡니다.
     */
    remotePatterns: [{ protocol: "https", hostname: "*.s3.ap-northeast-2.amazonaws.com" }],
  },
};

export default nextConfig;
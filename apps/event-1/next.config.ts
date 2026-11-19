import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/event_1",
  poweredByHeader: false,
  outputFileTracingRoot: process.cwd(),
  async headers() {
    const headers = [
      { key: "Cache-Control", value: "private, no-store" },
      { key: "X-Robots-Tag", value: "noindex, nofollow" },
      { key: "X-Frame-Options", value: "DENY" },
      // no-referrer makes native form POSTs send Origin: null and breaks the CSRF check.
      { key: "Referrer-Policy", value: "same-origin" },
      { key: "X-Content-Type-Options", value: "nosniff" },
    ];
    return [
      { source: "/ops/:path*", headers },
      { source: "/api/ops/:path*", headers },
    ];
  },
};

export default nextConfig;

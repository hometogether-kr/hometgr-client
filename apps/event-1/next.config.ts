import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/event_1",
  poweredByHeader: false,
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;

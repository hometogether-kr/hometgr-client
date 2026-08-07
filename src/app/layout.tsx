import type { Metadata, Viewport } from "next";

import { SessionHintProvider } from "@/domains/user";
import { hasSessionCookie } from "@/shared/api/server";
import { ToastProvider } from "@/shared/ui/toast";

import { QueryProvider } from "./query-provider";

import "./globals.css";

// 추후 next/font/local 사용
const PRETENDARD_CSS =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css";
const ICON_CSS = "https://googleapis.com";

export const metadata: Metadata = {
  title: {
    default: "홈투게더",
    template: "%s | 홈투게더",
  },
  description: "누군가에겐 남는 방, 누군가에겐 꼭 필요한 집. 홈투게더에서 시작하세요.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const authenticated = await hasSessionCookie();

  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link rel="stylesheet" href={PRETENDARD_CSS} />
        <link rel="stylesheet" href={ICON_CSS} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <SessionHintProvider authenticated={authenticated}>
          <QueryProvider>
            <ToastProvider>{children}</ToastProvider>
          </QueryProvider>
        </SessionHintProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { SessionHintProvider } from "@/domains/user";
import { hasSessionCookie } from "@/shared/api/server";
import { ToastProvider } from "@/shared/ui/toast";
import { QueryProvider } from "./query-provider";
import "./globals.css";

/**
 * Pretendard는 Google Fonts에 없어 next/font/google로 받을 수 없습니다.
 * 지금은 CDN 스타일시트로 로드하고, 폰트 파일을 저장소에 커밋하면
 * next/font/local로 옮겨 외부 의존과 FOUT를 없애세요.
 */
const PRETENDARD_CSS =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css";

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

/**
 * 세션 쿠키를 여기서 읽어 첫 HTML부터 로그인 상태를 반영합니다.
 *
 * 그 대가로 모든 페이지가 요청 시점에 렌더링됩니다(`cookies()`는 request-time API).
 * 매물·예약·마이페이지처럼 어차피 개인화되는 화면이 대부분이라 정적 프리렌더로
 * 얻을 이득이 크지 않다고 보고 선택했습니다.
 */
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

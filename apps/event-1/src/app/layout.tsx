import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "한 달 월세 지원 | 홈투게더",
  description: "거주를 원하는 대학교를 알려주세요. 홈투게더 입주 혜택을 안내해드려요.",
  robots: { index: false, follow: false },
};

interface EventLayoutProps {
  children: ReactNode;
}

export default function EventLayout({ children }: EventLayoutProps) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

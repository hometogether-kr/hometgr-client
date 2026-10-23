import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ShinhanHostFollowupPage } from "@/pages-layer/shinhan-host-followup";

export const metadata: Metadata = {
  title: "호스트 수익·걱정·소개서 안내 | 개발 확인",
  robots: { index: false, follow: false },
};

export default function Page() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <ShinhanHostFollowupPage />;
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ShinhanIntakePreviewPage } from "@/pages-layer/shinhan-intake-preview";

export const metadata: Metadata = {
  title: "신한 신청 공통 기반 | 개발 확인",
  robots: { index: false, follow: false },
};

export default function Page() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <ShinhanIntakePreviewPage />;
}

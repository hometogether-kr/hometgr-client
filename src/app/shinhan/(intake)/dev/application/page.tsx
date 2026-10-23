import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ShinhanSavedApplicationPage } from "@/pages-layer/shinhan-saved-application";

export const metadata: Metadata = {
  title: "신한 신청 저장·접수 확인 | 개발 확인",
  robots: { index: false, follow: false },
};

export default function Page() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <ShinhanSavedApplicationPage />;
}

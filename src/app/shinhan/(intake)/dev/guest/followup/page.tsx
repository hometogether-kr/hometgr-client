import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ShinhanGuestFollowupPage } from "@/pages-layer/shinhan-guest-followup";

export const metadata: Metadata = {
  title: "게스트 걱정·안내·신청 내역 | 개발 확인",
  robots: { index: false, follow: false },
};

export default function Page() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <ShinhanGuestFollowupPage />;
}

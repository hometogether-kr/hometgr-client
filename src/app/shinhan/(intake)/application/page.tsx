import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getShinhanSessionMode } from "@/features/shinhan-bridge";
import { ShinhanSavedApplicationPage } from "@/pages-layer/shinhan-saved-application";

export const metadata: Metadata = {
  title: "신한 신청 접수 확인 | 홈투게더",
  robots: { index: false, follow: false },
};

export default async function Page() {
  if ((await getShinhanSessionMode()) === "unavailable") notFound();
  return <ShinhanSavedApplicationPage />;
}

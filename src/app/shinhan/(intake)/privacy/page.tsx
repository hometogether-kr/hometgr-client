import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getShinhanSessionMode } from "@/features/shinhan-bridge";
import { ShinhanPrivacyPage } from "@/pages-layer/shinhan-privacy";

export const metadata: Metadata = {
  title: "신한 × 홈투게더 | 개인정보 수집·이용 동의 전문",
  robots: { index: false, follow: false },
};

export default async function Page() {
  if (process.env.NODE_ENV !== "development" && (await getShinhanSessionMode()) !== "remote")
    notFound();
  return <ShinhanPrivacyPage />;
}

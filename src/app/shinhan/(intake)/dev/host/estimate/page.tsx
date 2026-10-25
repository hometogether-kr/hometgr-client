import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getShinhanSessionMode } from "@/features/shinhan-bridge";
import { ShinhanHostEstimatePage } from "@/pages-layer/shinhan-host-intake";

export const metadata: Metadata = {
  title: "빈방 예상 월세 진단 | 개발 확인",
  robots: { index: false, follow: false },
};

export default async function Page() {
  if (process.env.NODE_ENV !== "development" && (await getShinhanSessionMode()) !== "remote")
    notFound();
  return <ShinhanHostEstimatePage />;
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getShinhanSessionMode } from "@/features/shinhan-bridge";
import { ShinhanHostEstimatePage } from "@/pages-layer/shinhan-host-intake";

export const metadata: Metadata = {
  title: "빈방 예상 월세 진단 | 신한 슈퍼SOL",
  robots: { index: false, follow: false },
};

export default async function Page() {
  if ((await getShinhanSessionMode()) === "unavailable") notFound();
  return <ShinhanHostEstimatePage />;
}

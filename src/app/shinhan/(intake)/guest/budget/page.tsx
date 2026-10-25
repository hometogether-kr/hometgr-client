import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getShinhanSessionMode } from "@/features/shinhan-bridge";
import { ShinhanGuestBudgetPage } from "@/pages-layer/shinhan-guest-intake";

export const metadata: Metadata = {
  title: "게스트 예산 매칭 | 신한 슈퍼SOL",
  robots: { index: false, follow: false },
};

export default async function Page() {
  if ((await getShinhanSessionMode()) === "unavailable") notFound();
  return <ShinhanGuestBudgetPage />;
}

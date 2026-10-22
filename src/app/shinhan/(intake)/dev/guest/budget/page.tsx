import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ShinhanGuestBudgetPage } from "@/pages-layer/shinhan-guest-intake";

export const metadata: Metadata = {
  title: "게스트 예산 매칭 | 개발 확인",
  robots: { index: false, follow: false },
};

export default function Page() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <ShinhanGuestBudgetPage />;
}

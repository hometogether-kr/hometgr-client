import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getShinhanSessionMode } from "@/features/shinhan-bridge";
import { ShinhanGuestDemandPage } from "@/pages-layer/shinhan-guest-intake";

export const metadata: Metadata = {
  title: "게스트 수요조사 | 개발 확인",
  robots: { index: false, follow: false },
};

export default async function Page() {
  if (process.env.NODE_ENV !== "development" && (await getShinhanSessionMode()) !== "remote")
    notFound();
  return <ShinhanGuestDemandPage />;
}

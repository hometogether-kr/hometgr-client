import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getShinhanSessionMode } from "@/features/shinhan-bridge";
import { ShinhanHostRegistrationPage } from "@/pages-layer/shinhan-host-intake";

export const metadata: Metadata = {
  title: "홈투게더 방 등록 | 신한 슈퍼SOL",
  robots: { index: false, follow: false },
};

export default async function Page() {
  if ((await getShinhanSessionMode()) === "unavailable") notFound();
  return <ShinhanHostRegistrationPage />;
}

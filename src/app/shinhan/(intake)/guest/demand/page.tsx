import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { getShinhanSessionMode } from "@/features/shinhan-bridge";
import { SHINHAN_GUEST_BUDGET_PATH } from "@/features/shinhan-intake";

export const metadata: Metadata = {
  title: "예산에 맞는 방 찾기 | 신한 슈퍼SOL",
  robots: { index: false, follow: false },
};

export default async function Page() {
  if ((await getShinhanSessionMode()) === "unavailable") notFound();
  redirect(SHINHAN_GUEST_BUDGET_PATH);
}

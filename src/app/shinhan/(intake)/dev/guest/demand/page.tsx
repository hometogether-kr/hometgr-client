import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { getShinhanSessionMode } from "@/features/shinhan-bridge";
import { SHINHAN_GUEST_BUDGET_PATH } from "@/features/shinhan-intake";

export const metadata: Metadata = {
  title: "예산에 맞는 방 찾기 | 개발 확인",
  robots: { index: false, follow: false },
};

export default async function Page() {
  if (process.env.NODE_ENV !== "development" && (await getShinhanSessionMode()) !== "remote")
    notFound();
  redirect(SHINHAN_GUEST_BUDGET_PATH);
}

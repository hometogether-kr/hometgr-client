import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ShinhanHostRegistrationPage } from "@/pages-layer/shinhan-host-intake";

export const metadata: Metadata = {
  title: "홈투게더 방 등록 | 개발 확인",
  robots: { index: false, follow: false },
};

export default function Page() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <ShinhanHostRegistrationPage />;
}

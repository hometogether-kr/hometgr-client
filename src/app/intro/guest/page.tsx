import type { Metadata } from "next";

import { IntroPage } from "@/pages-layer/intro";

export const metadata: Metadata = {
  title: "세입자 서비스 소개",
};

export default function IntroGuest() {
  return <IntroPage audience="guest" />;
}

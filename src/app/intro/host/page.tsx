import type { Metadata } from "next";

import { IntroPage } from "@/pages-layer/intro";

export const metadata: Metadata = {
  title: "집주인 서비스 소개",
};

export default function IntroHost() {
  return <IntroPage audience="host" />;
}

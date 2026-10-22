import type { Metadata } from "next";

import { ShinhanGuestPage } from "@/pages-layer/shinhan-guest";

export const metadata: Metadata = {
  title: "신한 슈퍼SOL × 홈투게더 | 게스트",
  description:
    "학교 근처의 나만의 방부터 함께 쓰는 생활 공간까지, 홈투게더의 게스트 서비스를 소개합니다.",
};

export default function Page() {
  return <ShinhanGuestPage />;
}

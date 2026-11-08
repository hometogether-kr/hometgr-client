import type { Metadata } from "next";

import { HostHomePage } from "@/pages-layer/host-home";

export const metadata: Metadata = {
  title: "집주인 서비스 소개",
  description:
    "비어 있는 방 한 칸, 검증된 청년으로 안심하고 매달 생활비로 여유롭게. 방 준비부터 입주, 거주 중 관리까지 홈투게더가 함께합니다.",
};

export default function IntroHost() {
  return <HostHomePage />;
}

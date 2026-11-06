import type { Metadata } from "next";

import { getShinhanSessionMode } from "@/features/shinhan-bridge";
import { ShinhanEntryProvider } from "@/features/shinhan-intake";
import { ShinhanHostPage } from "@/pages-layer/shinhan-host";

export const metadata: Metadata = {
  title: "신한 슈퍼SOL × 홈투게더 | 호스트",
  description:
    "살던 집의 빈방을 활용하는 방법부터 청년 입주와 거주 중 관리까지, 홈투게더의 호스트 서비스를 소개합니다.",
};

export default async function Page() {
  const sessionMode = await getShinhanSessionMode();
  return (
    <ShinhanEntryProvider available={sessionMode !== "unavailable"}>
      <ShinhanHostPage />
    </ShinhanEntryProvider>
  );
}

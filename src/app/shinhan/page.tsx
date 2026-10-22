import type { Metadata } from "next";

import { ShinhanRoleSelectionPage } from "@/pages-layer/shinhan-role-selection";

export const metadata: Metadata = {
  title: "신한 슈퍼SOL × 홈투게더",
  description: "나에게 맞는 홈투게더를 선택하세요. 집주인과 입주자를 위한 홈투게더 서비스.",
};

export default function Page() {
  return <ShinhanRoleSelectionPage />;
}

import type { Metadata } from "next";

import { RoomsPage } from "@/pages-layer/rooms";

export const metadata: Metadata = {
  title: "매물 보기",
};

// searchParams(필터·정렬·검색어) 파싱은 B(HOM-207)에서 추가합니다. Next 16에서
// searchParams는 Promise이므로 그때 이 컴포넌트를 async로 바꿔 파싱한 필터를 props로
// 내려보냅니다(설계 §3.1). A에는 필터가 없어 얇은 동기 라우트로 둡니다.
export default function Page() {
  return <RoomsPage />;
}

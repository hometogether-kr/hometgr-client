import type { Metadata } from "next";
import { ListingCompletePage } from "@/pages-layer/listing-complete";

export const metadata: Metadata = {
  title: "매물 등록 요청 완료 | 홈투게더",
};

export default function Page() {
  return <ListingCompletePage />;
}

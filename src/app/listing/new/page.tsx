import type { Metadata } from "next";
import { ListingStartPage } from "@/pages-layer/listing-start";

export const metadata: Metadata = {
  title: "매물 등록 | 홈투게더",
};

export default function Page() {
  return <ListingStartPage />;
}

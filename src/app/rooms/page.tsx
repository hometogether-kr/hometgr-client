import type { Metadata } from "next";

import { parseRoomFilter } from "@/features/filter-rooms";
import { RoomsPage } from "@/pages-layer/rooms";

export const metadata: Metadata = {
  title: "매물 보기",
};

/**
 * Next 16에서 `searchParams`는 Promise입니다(설계 §3.1). 서버에서 await해 파싱한 뒤
 * 필터를 props로 내려보냅니다. 클라이언트 `useSearchParams()`와 혼용하지 않습니다 —
 * 서버가 파싱한 값이 단일 경로입니다(§2-3).
 */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filter = parseRoomFilter(await searchParams);
  return <RoomsPage filter={filter} />;
}
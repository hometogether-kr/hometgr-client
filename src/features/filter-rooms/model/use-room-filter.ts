"use client";

import { useRouter } from "next/navigation";

import type { RoomSort } from "@/domains/room";
import { ROUTES } from "@/shared/config";

import type { RoomFilter } from "./room-filter";
import { EMPTY_ROOM_FILTER, serializeRoomFilter } from "./room-filter";

/**
 * 필터·정렬을 URL에 반영하는 쓰기 훅
 *
 * 읽기는 서버(`page.tsx`)가 `parseRoomFilter`로 하고 props로 내려주므로, 이 훅은
 * `useSearchParams`로 다시 읽지 않습니다 — 서버가 파싱한 현재 필터를 인자로 받아 그 위에
 * 패치합니다(설계 §2-3 "서버 값과 useSearchParams 혼용 금지").
 *
 * 결과셋이 바뀌는 변경이므로 `router.replace(url, { scroll: false })`를 씁니다. App
 * Router에는 shallow가 없어 replace가 새 RSC 요청을 만들고, scroll:false를 **명시**해야
 * 위치가 유지됩니다(§3.2). "더 보기"는 서버 재요청이 없어야 하므로 이 훅이 아니라
 * `window.history.replaceState`로 처리합니다(§2-2, 위젯에서).
 */
export function useRoomFilter(current: RoomFilter) {
  const router = useRouter();

  const replaceFilter = (next: RoomFilter) => {
    const query = serializeRoomFilter(next);
    router.replace(query ? `${ROUTES.rooms}?${query}` : ROUTES.rooms, { scroll: false });
  };

  // 필터·정렬 변경은 결과셋을 바꾸므로 page를 항상 1로 되돌립니다(설계 §3.4).
  const patchFilter = (partial: Partial<RoomFilter>) => {
    replaceFilter({ ...current, ...partial, page: 1 });
  };

  const setSort = (sort: RoomSort) => {
    patchFilter({ sort });
  };

  const resetFilter = () => {
    replaceFilter(EMPTY_ROOM_FILTER);
  };

  return { setSort, patchFilter, resetFilter };
}
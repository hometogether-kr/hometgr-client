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
 * URL 갱신은 두 경로로 나뉩니다(§3.2):
 * - `replace`: 정렬 즉시 반영, 칩 바 초기화 등 히스토리를 남기지 않을 변경
 * - `push`(commitFilter): 모달 "완료" — 뒤로가기로 이전 필터 조합에 돌아갈 수 있게
 *
 * 어느 쪽이든 `scroll: false`를 명시해야 위치가 유지됩니다(App Router엔 shallow 없음).
 * "더 보기"는 서버 재요청이 없어야 하므로 이 훅이 아니라 `window.history.replaceState`로
 * 처리합니다(§2-2, 위젯에서).
 */
export function useRoomFilter(current: RoomFilter) {
  const router = useRouter();

  const toUrl = (filter: RoomFilter) => {
    const query = serializeRoomFilter(filter);
    return query ? `${ROUTES.rooms}?${query}` : ROUTES.rooms;
  };

  // 필터·정렬 변경은 결과셋을 바꾸므로 page를 항상 1로 되돌립니다(설계 §3.4).
  const patchFilter = (partial: Partial<RoomFilter>) => {
    router.replace(toUrl({ ...current, ...partial, page: 1 }), { scroll: false });
  };

  const setSort = (sort: RoomSort) => {
    patchFilter({ sort });
  };

  const resetFilter = () => {
    router.replace(toUrl(EMPTY_ROOM_FILTER), { scroll: false });
  };

  // 모달 "완료" — 뒤로가기 복원을 위해 push. 새 조건이므로 page는 1부터.
  const commitFilter = (next: RoomFilter) => {
    router.push(toUrl({ ...next, page: 1 }), { scroll: false });
  };

  return { setSort, patchFilter, resetFilter, commitFilter };
}
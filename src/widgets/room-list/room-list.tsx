"use client";

import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { Suspense } from "react";

import { fetchRooms, RoomCard, roomQueryKeys } from "@/domains/room";
import type { RoomFilter } from "@/features/filter-rooms";
import {
  isRoomFilterActive,
  serializeRoomFilter,
  toRoomListQuery,
  useRoomFilter,
} from "@/features/filter-rooms";
import { ROUTES } from "@/shared/config";
import { BtnCta } from "@/shared/ui/btn-cta";
import { QueryErrorBoundary } from "@/shared/ui/error-boundary";

import { RoomListEmpty } from "./room-list-empty";
import { RoomListError } from "./room-list-error";
import { ROOM_GRID_CLASS } from "./room-list-grid";
import { RoomListSkeleton } from "./room-list-skeleton";
import { RoomListToolbar } from "./room-list-toolbar";

/** 첫 행(그리드 최대 4열) 카드에만 priority를 줍니다 */
const PRIORITY_CARD_COUNT = 4;

function buildRoomsUrl(filter: RoomFilter): string {
  const query = serializeRoomFilter(filter);
  return query ? `${ROUTES.rooms}?${query}` : ROUTES.rooms;
}

function RoomListContent({ filter }: { filter: RoomFilter }) {
  const { setSort, resetFilter } = useRoomFilter(filter);
  const listQuery = toRoomListQuery(filter);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery({
    // 정규화된 필터 문자열을 키로 씁니다 — 같은 조건이 항상 같은 캐시로 갑니다(설계 §2-6).
    // page는 키에 넣지 않습니다(무한 쿼리가 한 키 아래 페이지를 누적).
    queryKey: roomQueryKeys.list(serializeRoomFilter({ ...filter, page: 1 })),
    queryFn: ({ pageParam, signal }) => fetchRooms({ ...listQuery, page: pageParam }, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
  });

  const rooms = data.pages.flatMap((page) => page.rooms);
  const totalCount = data.pages[0]?.totalCount ?? 0;

  if (rooms.length === 0) {
    return (
      <RoomListEmpty
        variant={isRoomFilterActive(filter) ? "filtered" : "all"}
        onReset={resetFilter}
      />
    );
  }

  const handleLoadMore = () => {
    const nextPage = data.pages.length + 1;
    void fetchNextPage();
    // 서버 재요청 없이 URL의 page만 현재 로드한 페이지 수로 갱신합니다(설계 §2-2).
    window.history.replaceState(null, "", buildRoomsUrl({ ...filter, page: nextPage }));
  };

  return (
    <section>
      <h2 className="sr-only">매물 목록</h2>
      <RoomListToolbar totalCount={totalCount} sort={filter.sort} onSortChange={setSort} />
      <ul className={ROOM_GRID_CLASS}>
        {rooms.map((room, index) => (
          <RoomCard
            key={room.id}
            room={room}
            href={`${ROUTES.rooms}/${room.id}`}
            priority={index < PRIORITY_CARD_COUNT}
          />
        ))}
      </ul>
      {hasNextPage && (
        <div className="mt-12 flex flex-col items-center gap-3">
          <p className="text-label-1 text-grayscale-500">
            {totalCount}개 중 {rooms.length}개
          </p>
          <BtnCta
            variant="stroke"
            size="l"
            className="w-full"
            loading={isFetchingNextPage}
            onClick={handleLoadMore}
          >
            더 보기
          </BtnCta>
        </div>
      )}
    </section>
  );
}

/**
 * 매물 목록 위젯
 *
 * 로딩은 Suspense 폴백(스켈레톤), 조회 에러는 QueryErrorBoundary 폴백(다시 시도)로
 * 책임을 분리합니다. 목록·더보기를 한 훅(`useSuspenseInfiniteQuery`)으로 다룹니다(설계 §2-1).
 * 필터는 서버가 파싱해 props로 내려준 값을 그대로 받습니다(§2-3).
 */
export function RoomList({ filter }: { filter: RoomFilter }) {
  return (
    <QueryErrorBoundary fallback={({ reset }) => <RoomListError reset={reset} />}>
      <Suspense fallback={<RoomListSkeleton />}>
        <RoomListContent filter={filter} />
      </Suspense>
    </QueryErrorBoundary>
  );
}
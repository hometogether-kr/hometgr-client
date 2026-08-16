"use client";

import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { Suspense } from "react";

import { fetchRooms, RoomCard, roomQueryKeys } from "@/domains/room";
import { ROUTES } from "@/shared/config";
import { QueryErrorBoundary } from "@/shared/ui/error-boundary";

import { RoomListEmpty } from "./room-list-empty";
import { RoomListError } from "./room-list-error";
import { ROOM_GRID_CLASS } from "./room-list-grid";
import { RoomListSkeleton } from "./room-list-skeleton";
import { RoomListToolbar } from "./room-list-toolbar";

/** 첫 행(그리드 최대 4열) 카드에만 priority를 줍니다 */
const PRIORITY_CARD_COUNT = 4;

function RoomListContent() {
  const { data } = useSuspenseInfiniteQuery({
    queryKey: roomQueryKeys.list(""),
    queryFn: ({ pageParam }) => fetchRooms({ page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
  });

  const rooms = data.pages.flatMap((page) => page.rooms);
  const totalCount = data.pages[0]?.totalCount ?? 0;

  // A에는 필터가 없어 결과 0이면 항상 "전체 없음"입니다. 필터 유무에 따른 분기는
  // B~D에서 필터 상태를 받아 variant를 결정합니다.
  if (rooms.length === 0) {
    return <RoomListEmpty variant="all" />;
  }

  return (
    <section>
      <h2 className="sr-only">매물 목록</h2>
      <RoomListToolbar totalCount={totalCount} />
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
      {/* "더 보기" 버튼 자리 — B(HOM-207)에서 fetchNextPage/hasNextPage로 연결합니다 */}
    </section>
  );
}

/**
 * 매물 목록 위젯
 *
 * 로딩은 Suspense 폴백(스켈레톤), 조회 에러는 QueryErrorBoundary 폴백(다시 시도)로
 * 책임을 분리합니다(AGENTS.md Suspense And Error Handling). 목록·더보기를 한 훅
 * (`useSuspenseInfiniteQuery`)으로 다루므로 B에서 위젯을 다시 쓰지 않습니다(설계 §2-1).
 */
export function RoomList() {
  return (
    <QueryErrorBoundary fallback={({ reset }) => <RoomListError reset={reset} />}>
      <Suspense fallback={<RoomListSkeleton />}>
        <RoomListContent />
      </Suspense>
    </QueryErrorBoundary>
  );
}

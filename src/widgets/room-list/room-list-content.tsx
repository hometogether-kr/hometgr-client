"use client";

import { useSuspenseInfiniteQuery } from "@tanstack/react-query";

import { fetchRooms, RoomCard, roomQueryKeys } from "@/domains/room";
import type { RoomFilter } from "@/features/filter-rooms";
import {
  buildRoomFilterUrl,
  isRoomFilterActive,
  serializeRoomFilter,
  toRoomListQuery,
  useRoomFilter,
} from "@/features/filter-rooms";
import type { MockRoomSource, MockRoomSourceOptions } from "@/features/preview-rooms";
import { previewRoomQueryKeys } from "@/features/preview-rooms";
import { ROUTES } from "@/shared/config";
import { BtnCta } from "@/shared/ui/btn-cta";

import { RoomListEmpty } from "./room-list-empty";
import { ROOM_GRID_CLASS } from "./room-list-grid";
import { RoomListToolbar } from "./room-list-toolbar";

/** 첫 행(그리드 최대 4열) 카드에만 priority를 줍니다 */
const PRIORITY_CARD_COUNT = 4;

export function RoomListQueryContent({
  filter,
  previewOptions,
  previewSource,
}: {
  filter: RoomFilter;
  previewOptions?: MockRoomSourceOptions;
  previewSource?: MockRoomSource;
}) {
  const { setSort, resetFilter } = useRoomFilter(filter, { preview: Boolean(previewOptions) });
  const listQuery = toRoomListQuery(filter);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetchNextPageError } =
    useSuspenseInfiniteQuery({
      // 정규화된 필터 문자열을 키로 씁니다 — 같은 조건이 항상 같은 캐시로 갑니다(설계 §2-6).
      // 공유 URL의 시작 페이지도 캐시를 구분합니다.
      queryKey: previewOptions
        ? previewRoomQueryKeys.list(previewOptions, serializeRoomFilter(filter))
        : roomQueryKeys.list(serializeRoomFilter(filter)),
      queryFn: ({ pageParam, signal }) =>
        previewSource
          ? previewSource.listRooms({ ...listQuery, page: pageParam })
          : fetchRooms({ ...listQuery, page: pageParam }, signal),
      initialPageParam: filter.page,
      ...(previewSource ? { retry: false } : {}),
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

  const handleLoadMore = async () => {
    const result = await fetchNextPage();
    if (result.isError) return;
    const nextPage = result.data?.pages.at(-1)?.page;
    if (nextPage)
      window.history.replaceState(
        null,
        "",
        buildRoomFilterUrl({ ...filter, page: nextPage }, { preview: Boolean(previewOptions) }),
      );
  };

  return (
    <section>
      <h2 className="sr-only">매물 목록</h2>
      {previewOptions && (
        <p className="mb-3 text-sm text-grayscale-600">
          모의 매물입니다. 상세 화면도 가상 정보로 표시됩니다.
        </p>
      )}
      {filter.page > 1 && (
        <p className="mb-3 text-sm text-grayscale-600">{filter.page}페이지부터 표시합니다.</p>
      )}
      <RoomListToolbar totalCount={totalCount} sort={filter.sort} onSortChange={setSort} />
      <ul className={ROOM_GRID_CLASS}>
        {rooms.map((room, index) => (
          <RoomCard
            key={room.id}
            room={room}
            href={
              previewOptions
                ? `${ROUTES.rooms}/${room.id}?${new URLSearchParams({
                    preview: "rooms",
                    returnTo: buildRoomFilterUrl(
                      { ...filter, page: data.pages.at(-1)?.page ?? filter.page },
                      { preview: true },
                    ),
                  }).toString()}`
                : `${ROUTES.rooms}/${room.id}`
            }
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
            onClick={() => void handleLoadMore()}
          >
            더 보기
          </BtnCta>
          {isFetchNextPageError && (
            <p role="alert" className="text-sm text-system-error">
              다음 페이지를 불러오지 못했습니다. 더 보기를 다시 눌러주세요.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

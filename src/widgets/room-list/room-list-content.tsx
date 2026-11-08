"use client";

import { useQueryClient, useSuspenseInfiniteQuery } from "@tanstack/react-query";

import { fetchRooms, RoomCard, roomQueryKeys } from "@/domains/room";
import type { RoomFilter } from "@/features/filter-rooms";
import {
  buildRoomFilterUrl,
  isRoomFilterActive,
  saveRoomListPosition,
  serializeRoomFilter,
  toRoomListQuery,
  useRoomFilter,
  useRoomListScrollRestoration,
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
  const queryClient = useQueryClient();
  const queryKeyForPage = (page: number) =>
    previewOptions
      ? previewRoomQueryKeys.list(previewOptions, serializeRoomFilter({ ...filter, page }))
      : roomQueryKeys.list(serializeRoomFilter({ ...filter, page }));

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isFetchNextPageError,
    isRefetchError,
    refetch,
  } = useSuspenseInfiniteQuery({
    queryKey: queryKeyForPage(filter.page),
    queryFn: async ({ pageParam, signal }) => {
      const fetchPage = (page: number) =>
        previewSource
          ? previewSource.listRooms({ ...listQuery, page })
          : fetchRooms({ ...listQuery, page }, signal);
      const first = await fetchPage(pageParam.from);
      let result = first;
      const rooms = [...first.rooms];
      // 새로고침·캐시 만료 시에도 URL의 page까지 앞선 목록을 복원합니다.
      while (result.hasNext && result.page < pageParam.through) {
        signal.throwIfAborted();
        result = await fetchPage(result.page + 1);
        rooms.push(...result.rooms);
      }
      return { ...result, rooms };
    },
    initialPageParam: { from: 1, through: filter.page },
    staleTime: 0,
    refetchOnMount: "always",
    ...(previewSource ? { retry: false } : {}),
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? { from: lastPage.page + 1, through: lastPage.page + 1 } : undefined,
  });

  const rooms = [
    ...new Map(data.pages.flatMap((page) => page.rooms).map((room) => [room.id, room])).values(),
  ];
  const totalCount = data.pages[0]?.totalCount ?? 0;
  const returnHref = buildRoomFilterUrl(
    { ...filter, page: data.pages.at(-1)?.page ?? filter.page },
    { preview: Boolean(previewOptions) },
  );
  useRoomListScrollRestoration(
    buildRoomFilterUrl(filter, { preview: Boolean(previewOptions) }),
    isFetching,
  );

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
    if (nextPage && result.data) {
      // URL과 같은 캐시 키에도 누적 페이지를 보관해 상세 복귀 시 즉시 표시합니다.
      queryClient.setQueryData(queryKeyForPage(nextPage), result.data);
      window.history.replaceState(
        window.history.state,
        "",
        buildRoomFilterUrl({ ...filter, page: nextPage }, { preview: Boolean(previewOptions) }),
      );
    }
  };

  return (
    <section>
      <h2 className="sr-only">매물 목록</h2>
      {previewOptions && (
        <p className="mb-3 text-sm text-grayscale-600">
          모의 매물입니다. 상세 화면도 가상 정보로 표시됩니다.
        </p>
      )}
      {isRefetchError && (
        <p role="alert" className="mb-3 text-sm text-system-error">
          최신 목록을 확인하지 못했어요.{" "}
          <button className="underline" onClick={() => void refetch()}>
            다시 확인
          </button>
        </p>
      )}
      <RoomListToolbar totalCount={totalCount} sort={filter.sort} onSortChange={setSort} />
      <ul className={ROOM_GRID_CLASS}>
        {rooms.map((room, index) => (
          <RoomCard
            key={room.id}
            room={room}
            href={`${ROUTES.rooms}/${room.id}?${new URLSearchParams({
              ...(previewOptions ? { preview: "rooms" } : {}),
              returnTo: returnHref,
            }).toString()}`}
            onNavigate={() => saveRoomListPosition(returnHref, room.id)}
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
            disabled={isFetching}
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

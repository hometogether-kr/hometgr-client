"use client";

import dynamic from "next/dynamic";
import { Suspense, useState } from "react";

import type { RoomFilter } from "@/features/filter-rooms";
import { serializeRoomFilter } from "@/features/filter-rooms";
import type { MockRoomSourceOptions } from "@/features/preview-rooms";
import { createMockRoomSource } from "@/features/preview-rooms";
import { QueryErrorBoundary } from "@/shared/ui/error-boundary";

import { RoomListError } from "./room-list-error";
import { RoomListSkeleton } from "./room-list-skeleton";

// Same-origin BFF는 브라우저에서만 조회합니다. use client만으로는 SSR을 막지 못합니다.
const RoomListQueryContent = dynamic(
  () => import("./room-list-content").then((module) => module.RoomListQueryContent),
  { ssr: false, loading: () => <RoomListSkeleton /> },
);

export function RoomList({
  filter,
  previewOptions,
}: {
  filter: RoomFilter;
  previewOptions?: MockRoomSourceOptions;
}) {
  // 오류 경계가 목록을 다시 마운트해도 모의 응답의 첫 실패 기록을 보존한다.
  const [previewSource] = useState(() =>
    previewOptions ? createMockRoomSource(previewOptions) : undefined,
  );

  return (
    <QueryErrorBoundary
      key={serializeRoomFilter(filter)}
      fallback={({ reset }) => <RoomListError reset={reset} />}
    >
      <Suspense fallback={<RoomListSkeleton />}>
        <RoomListQueryContent
          filter={filter}
          previewOptions={previewOptions}
          previewSource={previewSource}
        />
      </Suspense>
    </QueryErrorBoundary>
  );
}

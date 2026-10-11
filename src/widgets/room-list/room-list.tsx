"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

import type { RoomFilter } from "@/features/filter-rooms";
import { QueryErrorBoundary } from "@/shared/ui/error-boundary";

import { RoomListError } from "./room-list-error";
import { RoomListSkeleton } from "./room-list-skeleton";

// Same-origin BFF는 브라우저에서만 조회합니다. use client만으로는 SSR을 막지 못합니다.
const RoomListQueryContent = dynamic(
  () => import("./room-list-content").then((module) => module.RoomListQueryContent),
  { ssr: false, loading: () => <RoomListSkeleton /> },
);

export function RoomList({ filter }: { filter: RoomFilter }) {
  return (
    <QueryErrorBoundary fallback={({ reset }) => <RoomListError reset={reset} />}>
      <Suspense fallback={<RoomListSkeleton />}>
        <RoomListQueryContent filter={filter} />
      </Suspense>
    </QueryErrorBoundary>
  );
}

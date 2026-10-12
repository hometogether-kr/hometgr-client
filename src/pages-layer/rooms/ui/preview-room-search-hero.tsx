"use client";

import { findSearchRegion, getSelectedRegion } from "@/domains/region";
import type { RoomFilter } from "@/features/filter-rooms";
import { useRoomFilter } from "@/features/filter-rooms";
import type { MockRoomSourceOptions } from "@/features/preview-rooms";
import { RoomRegionSearch } from "@/widgets/room-region-search";

interface PreviewRoomSearchHeroProps {
  filter: RoomFilter;
  previewOptions: MockRoomSourceOptions;
}

export function PreviewRoomSearchHero({ filter, previewOptions }: PreviewRoomSearchHeroProps) {
  const { patchFilter } = useRoomFilter(filter, { preview: true });
  return (
    <section className="flex flex-col items-center gap-8 pt-15 pb-6">
      <h1 className="text-[22px] font-semibold text-grayscale-900 sm:text-title-2">
        머물고 싶은 방을 탐색하세요
      </h1>
      <RoomRegionSearch
        key={JSON.stringify([filter.sido, filter.sigungu, previewOptions])}
        initialRegion={getSelectedRegion(filter.sido, filter.sigungu)?.label}
        layout="explore"
        previewOptions={previewOptions}
        onSearch={(value) => {
          const region = value ? findSearchRegion(value) : undefined;
          patchFilter({
            keyword: null,
            sido: region?.sido ?? null,
            sigungu: region?.sigungu ?? null,
          });
        }}
      />
    </section>
  );
}

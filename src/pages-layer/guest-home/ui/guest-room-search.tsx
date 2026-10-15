"use client";

import { findSearchRegion } from "@/domains/region";
import { EMPTY_ROOM_FILTER, getRoomRegionFilter, useRoomFilter } from "@/features/filter-rooms";
import type { MockRoomSourceOptions } from "@/features/preview-rooms";
import { RoomRegionSearch } from "@/widgets/room-region-search";

import styles from "./guest-home.module.css";

export function GuestRoomSearch({ previewOptions }: { previewOptions?: MockRoomSourceOptions }) {
  const { commitFilter } = useRoomFilter(EMPTY_ROOM_FILTER, { preview: Boolean(previewOptions) });
  return (
    <div className={styles.searchForm}>
      <RoomRegionSearch
        layout="main"
        previewOptions={previewOptions}
        onSearch={(value) => {
          const region = value ? findSearchRegion(value) : undefined;
          if (region) commitFilter({ ...EMPTY_ROOM_FILTER, ...getRoomRegionFilter(region) });
        }}
      />
    </div>
  );
}

"use client";

import { findSearchRegion } from "@/domains/region";
import { useRoomDistricts } from "@/domains/room";

/** 선택지는 공개 매물 구 목록, URL 유효성은 정적 행정 코드로 각각 판단합니다. */
export function useRoomFilterRegions(enabled = true) {
  const query = useRoomDistricts({ enabled });
  const data = query.data?.flatMap((district) => {
    const region = findSearchRegion(`${district.sido} ${district.sigungu}`);
    return region ? [region] : [];
  });
  return { ...query, data };
}

"use client";

import { useState } from "react";

import type { RoomFilter } from "@/features/filter-rooms";
import { useRoomFilter } from "@/features/filter-rooms";

/**
 * 검색어 입력 상태와 URL 커밋
 *
 * 검색어는 필터의 `keyword` 필드(URL `q`)입니다. URL 파싱·직렬화는 B(HOM-207)가 이미
 * 해뒀으므로 여기서 URL을 새로 조작하지 않고 `useRoomFilter(filter).patchFilter`만
 * 씁니다 — `patchFilter`가 `router.replace(scroll:false)`와 `page` 1 리셋까지 처리합니다.
 *
 * 입력창의 임시 값(draft)만 로컬 state로 들고, **Enter나 항목 선택 시에만** 커밋합니다.
 * 타이핑 중에는 URL을 건드리지 않습니다(디바운스 자동검색·자동완성 없음 — 설계 §7-3).
 * 초기값은 서버가 파싱해 내려준 `filter.keyword`입니다.
 */
export function useRoomSearch(filter: RoomFilter) {
  const { patchFilter } = useRoomFilter(filter);
  const [value, setValue] = useState(filter.keyword ?? "");

  /**
   * 검색어를 URL에 커밋합니다. `override`를 주면(최근 검색어 항목 클릭) 그 값을, 없으면
   * 현재 입력값을 씁니다. 커밋한 검색어(공백 정리 후)를 반환해 호출부가 최근 검색어에
   * 저장할지 판단하게 합니다. 빈 문자열이면 `keyword`를 null로 지워 `q`를 URL에서 뺍니다.
   */
  const commit = (override?: string): string | null => {
    const raw = override ?? value;
    const trimmed = raw.trim();
    setValue(trimmed);
    patchFilter({ keyword: trimmed || null });
    return trimmed || null;
  };

  return { value, setValue, commit };
}
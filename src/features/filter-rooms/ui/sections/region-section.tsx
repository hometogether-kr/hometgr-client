"use client";

import { useId } from "react";

import { SEARCH_REGIONS } from "@/domains/region";
import { cn } from "@/shared/lib/cn";

import type { RoomFilter } from "../../model/room-filter";
import { SectionHeader } from "../section-header";

interface SectionProps {
  draft: RoomFilter;
  patch: (partial: Partial<RoomFilter>) => void;
}

export function RegionSection({ draft, patch }: SectionProps) {
  const titleId = useId();
  return (
    <div>
      <SectionHeader
        title="서울 자치구 선택"
        titleId={titleId}
        resetLabel="지역 초기화"
        canReset={draft.sido !== null || draft.keyword !== null}
        onReset={() => patch({ sido: null, sigungu: null, keyword: null })}
      />
      <p className="mb-4 text-sm text-grayscale-600">
        현재 자치구 단위 검색을 지원합니다. 서울 전체·기타 지역은 준비 중입니다.
      </p>
      <div
        role="group"
        aria-labelledby={titleId}
        className="grid grid-cols-2 overflow-hidden rounded-lg border border-grayscale-200"
      >
        {SEARCH_REGIONS.map((region) => {
          const selected = draft.sido === region.sido && draft.sigungu === region.sigungu;
          return (
            <button
              key={region.sigungu}
              type="button"
              aria-pressed={selected}
              onClick={() => patch({ sido: region.sido, sigungu: region.sigungu, keyword: null })}
              className={cn(
                "border border-grayscale-100 p-4 text-left text-base focus-visible:outline-2 focus-visible:outline-primary-500",
                selected ? "bg-primary-100 text-primary-600" : "text-grayscale-600",
              )}
            >
              {region.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

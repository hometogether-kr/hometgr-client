"use client";

import { useId } from "react";

import { SEARCH_REGIONS } from "@/domains/region";
import { cn } from "@/shared/lib/cn";

import type { RoomFilter } from "../../model/room-filter";
import { SectionHeader } from "../section-header";

interface SectionProps {
  regions?: typeof SEARCH_REGIONS;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  draft: RoomFilter;
  patch: (partial: Partial<RoomFilter>) => void;
}

export function RegionSection({ draft, patch, regions, loading, error, onRetry }: SectionProps) {
  const titleId = useId();
  return (
    <div>
      <SectionHeader
        title={regions ? "지역구 선택" : "서울 자치구 선택"}
        titleId={titleId}
        resetLabel="지역 초기화"
        canReset={draft.sido !== null || draft.keyword !== null}
        onReset={() => patch({ sido: null, sigungu: null, keyword: null })}
      />
      <p className="mb-4 text-sm text-grayscale-600">
        {regions
          ? "매물이 있는 지역만 선택할 수 있어요."
          : "현재 자치구 단위 검색을 지원합니다. 서울 전체·기타 지역은 준비 중입니다."}
      </p>
      {loading ? (
        <p role="status">지역 목록을 불러오고 있어요.</p>
      ) : error ? (
        <div role="alert">
          <p>지역 목록을 불러오지 못했어요.</p>
          <button type="button" onClick={onRetry} className="mt-3 text-primary-500 underline">
            다시 시도
          </button>
        </div>
      ) : regions?.length === 0 ? (
        <p role="status">선택할 수 있는 지역이 없어요.</p>
      ) : (
        <div
          role="group"
          aria-labelledby={titleId}
          className="grid grid-cols-2 overflow-hidden rounded-lg border border-grayscale-200"
        >
          {(regions ?? SEARCH_REGIONS).map((region) => {
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
      )}
    </div>
  );
}

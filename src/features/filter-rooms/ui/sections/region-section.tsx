"use client";

import { useId } from "react";

import type { SearchRegion } from "@/domains/region";
import { getSelectedRegion } from "@/domains/region";
import { cn } from "@/shared/lib/cn";

import type { RoomFilter } from "../../model/room-filter";
import { getRoomRegionFilter } from "../../model/room-filter";
import { SectionHeader } from "../section-header";

interface SectionProps {
  regions: SearchRegion[];
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  draft: RoomFilter;
  patch: (partial: Partial<RoomFilter>) => void;
}

export function RegionSection({ draft, patch, regions, loading, error, onRetry }: SectionProps) {
  const titleId = useId();
  const selectedRegion = getSelectedRegion(draft.sido, draft.sigungu);
  const unavailableSelection =
    selectedRegion &&
    !loading &&
    !error &&
    !regions.some((region) => region.sigungu === selectedRegion.sigungu);
  return (
    <div>
      <SectionHeader
        title="원하는 지역을 선택하세요."
        titleId={titleId}
        resetLabel="지역 초기화"
        canReset={draft.sido !== null || draft.sigungu !== null || draft.keyword !== null}
        onReset={() => patch(getRoomRegionFilter(null))}
      />
      {unavailableSelection && (
        <p role="status" className="mb-4 text-sm text-grayscale-600">
          현재 선택: {selectedRegion.name}. 현재 공개 매물이 없을 수 있어요. 선택을 유지하거나
          초기화할 수 있어요.
        </p>
      )}
      {loading ? (
        <p role="status">지역 목록을 불러오고 있어요.</p>
      ) : error ? (
        <div role="alert">
          <p>지역 목록을 불러오지 못했어요.</p>
          <button type="button" onClick={onRetry} className="mt-3 text-primary-500 underline">
            다시 시도
          </button>
        </div>
      ) : regions.length === 0 ? (
        <p role="status">선택할 수 있는 지역이 없어요.</p>
      ) : (
        <div className="relative overflow-hidden rounded-xl before:pointer-events-none before:absolute before:inset-0 before:z-10 before:rounded-xl before:border before:border-grayscale-200">
          <div className="flex h-[72px] items-center border-b border-grayscale-200 bg-grayscale-50 px-5 text-headline-1 font-medium text-grayscale-800">
            서울
          </div>
          <div role="group" aria-labelledby={titleId} className="grid grid-cols-2">
            {regions.map((region, index) => {
              const selected = draft.sido === region.sido && draft.sigungu === region.sigungu;
              return (
                <button
                  key={region.sigungu}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => patch(getRoomRegionFilter(region))}
                  className={cn(
                    "flex h-[65px] min-w-0 items-center border-grayscale-200 pr-4 pl-5 text-left text-headline-1 font-medium focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-500",
                    index % 2 === 0 && "border-r",
                    index < Math.floor((regions.length - 1) / 2) * 2 && "border-b",
                    selected ? "bg-primary-100 text-primary-600" : "bg-white text-grayscale-600",
                  )}
                >
                  {region.name}
                </button>
              );
            })}
            {regions.length % 2 === 1 && <div aria-hidden="true" className="bg-white" />}
          </div>
        </div>
      )}
      <p className="mt-3 text-label-1 text-grayscale-600">매물이 있는 지역만 선택할 수 있어요.</p>
    </div>
  );
}

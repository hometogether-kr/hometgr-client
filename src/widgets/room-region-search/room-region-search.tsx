"use client";

import Image from "next/image";
import type { KeyboardEvent } from "react";
import { useId, useRef, useState } from "react";

import { findSearchRegion } from "@/domains/region";
import { useRoomFilterRegions } from "@/features/filter-rooms";
import type { MockRoomSourceOptions } from "@/features/preview-rooms";
import { usePreviewRegions } from "@/features/preview-rooms";
import { cn } from "@/shared/lib/cn";
import { useOutsideClick } from "@/shared/lib/hooks";
import { BtnCta } from "@/shared/ui/btn-cta";

interface RoomRegionSearchProps {
  initialRegion?: string;
  layout: "main" | "explore";
  previewOptions?: MockRoomSourceOptions;
  onSearch: (region: string | undefined) => void;
}

export function RoomRegionSearch({
  initialRegion,
  layout,
  previewOptions,
  onSearch,
}: RoomRegionSearchProps) {
  const [selectedRegion, setSelectedRegion] = useState(initialRegion);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [error, setError] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const id = useId();
  const listId = `${id}-regions`;
  const liveRegions = useRoomFilterRegions(!previewOptions && open);
  const previewRegions = usePreviewRegions(previewOptions, open);
  const regions = previewOptions ? previewRegions : liveRegions;
  const options = previewOptions
    ? (previewRegions.data ?? []).flatMap((item) => {
        const region = findSearchRegion(item.value);
        return region ? [{ value: region.label, label: region.name }] : [];
      })
    : (liveRegions.data ?? []).map((region) => ({ value: region.label, label: region.name }));
  const selected = options.find((region) => region.value === selectedRegion);
  const label = selected?.label ?? selectedRegion?.split(" ").at(-1);

  function closePanel() {
    setOpen(false);
    setActiveIndex(-1);
  }

  useOutsideClick(rootRef, closePanel, open);

  function selectRegion(value: string) {
    setSelectedRegion(value);
    setError("");
    closePanel();
    triggerRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closePanel();
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      const direction = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((index) => {
        if (!options.length) return -1;
        if (index < 0) return direction > 0 ? 0 : options.length - 1;
        return (index + direction + options.length) % options.length;
      });
    } else if (event.key === "Home" && open) {
      event.preventDefault();
      setActiveIndex(options.length ? 0 : -1);
    } else if (event.key === "End" && open) {
      event.preventDefault();
      setActiveIndex(options.length - 1);
    } else if ((event.key === "Enter" || event.key === " ") && open && options[activeIndex]) {
      event.preventDefault();
      selectRegion(options[activeIndex].value);
    }
  }

  return (
    <div
      ref={rootRef}
      className={cn("relative w-full", layout === "main" ? "max-w-[473px]" : "max-w-[990px]")}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) closePanel();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          closePanel();
          triggerRef.current?.focus();
        }
      }}
    >
      <form
        role="search"
        aria-label="지역구로 매물 검색"
        className={cn(
          "flex h-14 items-stretch",
          layout === "main" ? "gap-2" : "rounded-xl border border-grayscale-300 bg-white pr-4",
          open && layout === "explore" && "border-primary-500 ring-1 ring-primary-500",
        )}
        onSubmit={(event) => {
          event.preventDefault();
          if (layout === "main" && !selectedRegion) {
            setError("원하는 지역을 선택해주세요");
            closePanel();
            return;
          }
          setError("");
          closePanel();
          onSearch(selectedRegion);
        }}
      >
        <button
          ref={triggerRef}
          type="button"
          role="combobox"
          aria-label={label ? `지역구 선택: ${label}` : "지역구 선택"}
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-haspopup="listbox"
          aria-activedescendant={
            open && options[activeIndex] ? `${id}-option-${activeIndex}` : undefined
          }
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={Boolean(error)}
          onClick={() => {
            setOpen(!open);
            setActiveIndex(-1);
            setError("");
          }}
          onKeyDown={handleKeyDown}
          className={cn(
            "min-w-0 flex-1 rounded-xl text-left text-base focus-visible:outline-2 focus-visible:outline-primary-500",
            label ? "text-grayscale-900" : "text-grayscale-500",
            layout === "main"
              ? "border border-grayscale-300 bg-white px-3 font-bold sm:px-5"
              : "px-4 font-medium",
            open && layout === "main" && "border-primary-500 ring-1 ring-primary-500",
          )}
        >
          <span className="block truncate">{label ?? "지역구를 선택해주세요"}</span>
        </button>
        {layout === "main" ? (
          <BtnCta
            type="submit"
            variant="stroke"
            className="h-14 w-[90px] shrink-0 border-primary-300 font-bold text-primary-500"
          >
            검색
          </BtnCta>
        ) : (
          <button
            type="submit"
            aria-label="검색"
            className="shrink-0 self-center rounded-lg focus-visible:outline-2 focus-visible:outline-primary-500"
          >
            <Image src="/images/room-search/search.svg" width={24} height={24} alt="" />
          </button>
        )}
      </form>
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="absolute top-full mt-2 text-sm text-system-error"
        >
          {error}
        </p>
      )}
      {open && (
        <div
          className={cn(
            "absolute top-full right-0 left-0 z-30 flex flex-col gap-4 rounded-2xl border border-grayscale-300 bg-white p-5 shadow-dropdown",
            layout === "main" ? "mt-3" : "mt-8",
          )}
        >
          <h2 id={`${id}-title`} className="text-heading-2 font-semibold text-grayscale-900">
            지역구 선택
          </h2>
          <p className="text-sm leading-normal text-grayscale-600">
            매물이 있는 지역만 선택할 수 있어요.
          </p>
          <div
            id={listId}
            role="listbox"
            aria-labelledby={`${id}-title`}
            aria-busy={regions.isFetching}
            className="flex max-h-64 flex-col gap-2 overflow-y-auto"
          >
            {!regions.isPending &&
              !regions.isError &&
              options.map((region, index) => (
                <button
                  key={region.value}
                  id={`${id}-option-${index}`}
                  type="button"
                  role="option"
                  tabIndex={-1}
                  aria-selected={region.value === selectedRegion}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectRegion(region.value)}
                  className={cn(
                    "flex h-12 shrink-0 items-center justify-between rounded-lg px-3 text-left text-[15px] text-grayscale-900",
                    region.value === selectedRegion && "bg-primary-100 font-semibold",
                    activeIndex === index && "outline-2 -outline-offset-2 outline-primary-500",
                  )}
                >
                  {region.label}
                  {region.value === selectedRegion && (
                    <span aria-hidden="true" className="font-bold text-primary-500">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            {regions.isPending &&
              [0, 1, 2].map((item) => (
                <div
                  key={item}
                  aria-hidden="true"
                  className="h-10 shrink-0 animate-pulse rounded-lg bg-grayscale-100"
                />
              ))}
          </div>
          {regions.isPending && (
            <p role="status" className="text-sm text-grayscale-600">
              지역 목록을 불러오고 있어요.
            </p>
          )}
          {regions.isError && (
            <div role="alert" className="flex flex-col items-start gap-3">
              <p className="font-semibold text-grayscale-900">지역 목록을 불러오지 못했어요.</p>
              <button
                type="button"
                disabled={regions.isFetching}
                onClick={() => void regions.refetch()}
                className="text-sm font-semibold text-primary-500 focus-visible:outline-2 focus-visible:outline-primary-500"
              >
                다시 시도
              </button>
            </div>
          )}
          {!regions.isPending && !regions.isError && options.length === 0 && (
            <div role="status" className="flex flex-col gap-3">
              <p className="font-semibold text-grayscale-900">선택할 수 있는 지역이 없어요.</p>
              <p className="text-sm text-grayscale-600">현재 공개 매물이 있는 지역이 없습니다.</p>
            </div>
          )}
          {previewOptions && <p className="text-xs text-grayscale-500">지역은 가상 예시</p>}
        </div>
      )}
    </div>
  );
}

"use client";

import type { FormEvent, KeyboardEvent } from "react";
import { useId, useRef, useState } from "react";

import type { RoomFilter } from "@/features/filter-rooms";
import { useRecentKeywords, useRoomSearch } from "@/features/search-rooms";
import { useOutsideClick } from "@/shared/lib/hooks";
import { Icon } from "@/shared/ui/icons";

import { RecentKeywordPanel } from "./recent-keyword-panel";

interface RoomSearchHeroProps {
  filter: RoomFilter;
}

/**
 * 매물 탐색 히어로 (Figma: node 1061:39945)
 *
 * 페이지 제목(`<h1>`) + 검색 입력 + 최근 검색어 패널. 검색어는 필터의 `keyword` 필드라
 * URL 커밋은 B(HOM-207)의 `useRoomSearch`(내부적으로 `patchFilter`)가 담당합니다. 이
 * 위젯은 포커스·패널 토글·키보드 이동만 다룹니다.
 *
 * WAI-ARIA editable combobox 패턴: 입력창이 `role="combobox"`, 패널이 팝업 listbox입니다.
 * 포커스는 입력창에 머무르고 하이라이트는 `aria-activedescendant`로 가리킵니다. Enter는
 * 하이라이트된 최근 검색어가 있으면 그것을, 없으면 입력값을 커밋합니다.
 */
export function RoomSearchHero({ filter }: RoomSearchHeroProps) {
  const { value, setValue, commit } = useRoomSearch(filter);
  const { keywords, addKeyword, removeKeyword, clearKeywords } = useRecentKeywords();

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);

  const baseId = useId();
  const listId = `${baseId}-recent`;
  const optionId = (index: number) => `${baseId}-recent-${index}`;

  // 최근 검색어가 없으면 펼칠 게 없으므로 패널·aria-expanded를 닫힌 것으로 취급합니다.
  const expanded = open && keywords.length > 0;

  useOutsideClick(rootRef, () => setOpen(false), open);

  const close = () => {
    setOpen(false);
    setActiveIndex(-1);
  };

  /** 입력값을 커밋하고, 비어 있지 않으면 최근 검색어에 저장합니다. */
  const submitTyped = () => {
    const committed = commit();
    if (committed) addKeyword(committed);
    close();
  };

  /** 최근 검색어 항목을 선택 — 입력값을 채우고 커밋하며 최신으로 승격합니다. */
  const selectKeyword = (keyword: string) => {
    setValue(keyword);
    commit(keyword);
    addKeyword(keyword);
    close();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitTyped();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "ArrowDown":
        if (keywords.length === 0) break;
        event.preventDefault();
        setOpen(true);
        setActiveIndex((prev) => Math.min(prev + 1, keywords.length - 1));
        break;
      case "ArrowUp":
        if (!expanded) break;
        event.preventDefault();
        // -1까지 허용해 입력창으로 다시 돌아옵니다.
        setActiveIndex((prev) => Math.max(prev - 1, -1));
        break;
      case "Enter":
        // 하이라이트된 최근 검색어가 있으면 그걸 선택(폼 제출을 막음).
        // 없으면 preventDefault 하지 않고 폼 onSubmit이 입력값을 커밋하게 둡니다.
        if (expanded && activeIndex >= 0) {
          event.preventDefault();
          selectKeyword(keywords[activeIndex]);
        }
        break;
      case "Escape":
        if (open) {
          event.preventDefault();
          close();
        }
        break;
      default:
        break;
    }
  };

  return (
    <section className="flex flex-col items-center gap-8 pt-15 pb-6">
      <h1 className="text-title-2 font-semibold text-grayscale-900">머물고 싶은 방을 탐색하세요</h1>

      <div ref={rootRef} className="relative w-full max-w-[990px]">
        <form onSubmit={handleSubmit}>
          <label htmlFor={`${baseId}-input`} className="sr-only">
            매물 검색
          </label>
          <div className="flex items-center rounded-xl border border-grayscale-300 bg-white py-2 pr-3 pl-5 focus-within:border-primary-500">
            <input
              id={`${baseId}-input`}
              type="search"
              role="combobox"
              aria-expanded={expanded}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
              value={value}
              onChange={(event) => {
                setValue(event.target.value);
                setOpen(true);
                setActiveIndex(-1);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="지역, 동, 지하철역 등으로 검색해보세요"
              className="min-w-0 flex-1 bg-transparent text-body-1 font-medium text-grayscale-900 placeholder:text-grayscale-300 focus:outline-none"
            />
            <button
              type="submit"
              aria-label="검색"
              className="shrink-0 rounded-lg p-2 text-grayscale-600 transition-colors hover:text-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <Icon name="search" size={24} />
            </button>
          </div>
        </form>

        {expanded && (
          <RecentKeywordPanel
            keywords={keywords}
            activeIndex={activeIndex}
            listId={listId}
            optionId={optionId}
            onSelect={selectKeyword}
            onRemove={removeKeyword}
            onClearAll={clearKeywords}
            onActiveIndexChange={setActiveIndex}
          />
        )}
      </div>
    </section>
  );
}
"use client";

import Image from "next/image";
import type { KeyboardEvent, ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";

import type { SearchRegion } from "@/domains/region";
import { cn } from "@/shared/lib/cn";
import { BtnCta } from "@/shared/ui/btn-cta";
import { Modal } from "@/shared/ui/modal";

import type { RoomFilter } from "../model/room-filter";
import { useFilterDraft } from "../model/use-filter-draft";
import { GenderSection } from "./sections/gender-section";
import { MoveInSection } from "./sections/move-in-section";
import { RegionSection } from "./sections/region-section";
import { RoomTypeSection } from "./sections/room-type-section";
import { TermSection } from "./sections/term-section";

/** 이번 배포의 검색 조건: 지역·입주일·거주 기간·유형·성별. */
export type FilterTab = "region" | "moveIn" | "term" | "type" | "gender";

const TABS: readonly { id: FilterTab; label: string }[] = [
  { id: "region", label: "지역" },
  { id: "moveIn", label: "입주 희망일" },
  { id: "term", label: "최소 계약 기간" },
  { id: "type", label: "매물 유형" },
  { id: "gender", label: "성별" },
];

type SectionComponent = (props: {
  draft: RoomFilter;
  patch: (partial: Partial<RoomFilter>) => void;
}) => ReactNode;

const SECTIONS: Record<Exclude<FilterTab, "region">, SectionComponent> = {
  moveIn: MoveInSection,
  term: TermSection,
  type: RoomTypeSection,
  gender: GenderSection,
};

interface RoomFilterModalProps {
  regionOptions: SearchRegion[];
  regionLoading?: boolean;
  regionError?: boolean;
  onRegionRetry?: () => void;
  /** 어느 칩으로 열었는지에 따른 초기 활성 탭 */
  initialTab: FilterTab;
  /** 현재 URL 필터 — 초안 스냅샷의 원본 */
  filter: RoomFilter;
  /** 닫기(초안 폐기): Esc·배경·헤더 X가 모두 이 콜백으로 옵니다 */
  onClose: () => void;
  /** "완료": 초안을 커밋 */
  onApply: (next: RoomFilter) => void;
}

/**
 * Figma 매물검색필터(1067:43383): 572×791, px40/py36, gap24, 완료 버튼 h43.
 * 작은 화면은 카드 높이를 제한하고 본문만 스크롤해 헤더·탭·완료 버튼을 유지합니다.
 *
 * 각 탭 패널에는 해당 섹션을 그려 초안(`draft`)을 편집합니다. "완료"는 초안이 현재
 * 필터와 다를 때만 완료 버튼이 활성화됩니다.
 */
export function RoomFilterModal({
  initialTab,
  filter,
  onClose,
  onApply,
  regionOptions,
  regionLoading,
  regionError,
  onRegionRetry,
}: RoomFilterModalProps) {
  const { draft, patchDraft, isDirty } = useFilterDraft(filter);
  const [activeTab, setActiveTab] = useState<FilterTab>(initialTab);
  const baseId = useId();
  const tabId = (id: FilterTab) => `${baseId}-tab-${id}`;
  const panelId = (id: FilterTab) => `${baseId}-panel-${id}`;
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const panelRef = useRef<HTMLDivElement>(null);

  // 탭을 바꾸면 이전 탭의 스크롤 위치가 남지 않도록 패널을 맨 위로 되돌립니다.
  useEffect(() => {
    panelRef.current?.scrollTo({ top: 0 });
  }, [activeTab]);

  const focusTab = (id: FilterTab) => {
    setActiveTab(id);
    tabRefs.current[id]?.focus();
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      const dir = event.key === "ArrowRight" ? 1 : -1;
      focusTab(TABS[(index + dir + TABS.length) % TABS.length].id);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusTab(TABS[0].id);
    } else if (event.key === "End") {
      event.preventDefault();
      focusTab(TABS[TABS.length - 1].id);
    }
  };

  const footer = (
    <BtnCta
      size="xl"
      className="h-[43px] w-full py-0"
      disabled={!isDirty}
      onClick={() => onApply(draft)}
    >
      완료
    </BtnCta>
  );

  return (
    <Modal
      open
      onClose={onClose}
      title="필터"
      closeButton="header"
      closeIcon={<Image src="/figma/filter-close.svg" width={20} height={20} alt="" />}
      footer={footer}
      classNames={{
        overlay: "px-4 py-4 md:px-5 md:py-6",
        dialog: "min-h-0 max-w-[572px]",
        panel:
          "h-[791px] max-h-[calc(100dvh-2rem)] min-h-0 gap-6 overflow-hidden px-5 py-6 md:max-h-[calc(100dvh-3rem)] md:px-10 md:py-9",
        header: "h-11",
        closeButton: "rounded-lg focus-visible:outline-2 focus-visible:outline-primary-500",
      }}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        {/* 탭바: 고정 헤더 — 스크롤 영역 밖에 둬 캘린더처럼 큰 탭에서도 사라지지 않습니다(QA C) */}
        <div
          role="tablist"
          aria-label="필터 항목"
          className="flex shrink-0 gap-x-4 gap-y-3 overflow-x-auto max-sm:flex-wrap"
        >
          {TABS.map((tab, index) => {
            const selected = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[tab.id] = el;
                }}
                type="button"
                role="tab"
                id={tabId(tab.id)}
                aria-selected={selected}
                aria-controls={panelId(tab.id)}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                className={cn(
                  "relative shrink-0 pb-3.5 text-body-2 font-semibold whitespace-nowrap transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none",
                  selected
                    ? "text-grayscale-900 after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:bg-grayscale-900"
                    : "text-grayscale-400",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div
          ref={panelRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
          tabIndex={0}
          aria-label="필터 선택 내용"
        >
          {TABS.map((tab) => {
            const Section = tab.id === "region" ? null : SECTIONS[tab.id];
            return (
              <div
                key={tab.id}
                role="tabpanel"
                id={panelId(tab.id)}
                aria-labelledby={tabId(tab.id)}
                hidden={tab.id !== activeTab}
              >
                {tab.id === activeTab &&
                  (tab.id === "region" ? (
                    <RegionSection
                      draft={draft}
                      patch={patchDraft}
                      regions={regionOptions}
                      loading={regionLoading}
                      error={regionError}
                      onRetry={onRegionRetry}
                    />
                  ) : (
                    Section && <Section draft={draft} patch={patchDraft} />
                  ))}
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}

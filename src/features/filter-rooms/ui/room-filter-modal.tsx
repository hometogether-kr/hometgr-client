"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { useId, useRef, useState } from "react";

import { cn } from "@/shared/lib/cn";
import { BtnCta } from "@/shared/ui/btn-cta";
import { Modal } from "@/shared/ui/modal";

import type { RoomFilter } from "../model/room-filter";
import { hasRoomFilterError } from "../model/room-filter";
import { useFilterDraft } from "../model/use-filter-draft";
import { MoveInSection } from "./sections/move-in-section";
import { OccupancySection } from "./sections/occupancy-section";
import { PriceSection } from "./sections/price-section";
import { RegionSection } from "./sections/region-section";
import { RoomTypeSection } from "./sections/room-type-section";
import { TermSection } from "./sections/term-section";

/** 모달 탭 6개 (칩 8개가 이 6개로 매핑됩니다 — 설계 §6.4·§11) */
export type FilterTab = "region" | "moveIn" | "term" | "price" | "type" | "occupancy";

const TABS: readonly { id: FilterTab; label: string }[] = [
  { id: "region", label: "지역" },
  { id: "moveIn", label: "입주 희망일" },
  { id: "term", label: "최소 계약 기간" },
  { id: "price", label: "보증금·월세" },
  { id: "type", label: "매물 유형" },
  { id: "occupancy", label: "인원·성별" },
];

type SectionComponent = (props: {
  draft: RoomFilter;
  patch: (partial: Partial<RoomFilter>) => void;
}) => ReactNode;

const SECTIONS: Record<FilterTab, SectionComponent> = {
  region: RegionSection,
  moveIn: MoveInSection,
  term: TermSection,
  price: PriceSection,
  type: RoomTypeSection,
  occupancy: OccupancySection,
};

interface RoomFilterModalProps {
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
 * 필터 모달 (Figma: 1061:39358 · 1067:43383)
 *
 * `shared/ui/modal`을 재사용하되 탭 전용 슬롯이 없어 탭바 + 패널을 하나의 `div`로 묶어
 * children으로 넘깁니다(설계 §6.4). 폭은 Modal 기본값(`w-full md:w-[572px]`)을 그대로
 * 씁니다 — 접두사 없는 `w-[572px]`를 넘기면 tailwind-merge가 `w-full`을 지웁니다.
 *
 * 각 탭 패널에는 해당 섹션을 그려 초안(`draft`)을 편집합니다. "완료"는 초안이 현재
 * 필터와 다르고(isDirty) 금액 범위 에러가 없을 때만 활성입니다(§9).
 */
export function RoomFilterModal({ initialTab, filter, onClose, onApply }: RoomFilterModalProps) {
  const { draft, patchDraft, isDirty } = useFilterDraft(filter);
  const [activeTab, setActiveTab] = useState<FilterTab>(initialTab);
  const baseId = useId();
  const tabId = (id: FilterTab) => `${baseId}-tab-${id}`;
  const panelId = (id: FilterTab) => `${baseId}-panel-${id}`;
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

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
      className="w-full"
      disabled={!isDirty || hasRoomFilterError(draft)}
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
      footer={footer}
      classNames={{ panel: "md:h-[791px]" }}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div role="tablist" aria-label="필터 항목" className="flex gap-4 overflow-x-auto">
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
                  "shrink-0 border-b-2 pb-3.5 text-body-2 font-semibold whitespace-nowrap transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none",
                  selected
                    ? "border-grayscale-900 text-grayscale-900"
                    : "border-transparent text-grayscale-400",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {TABS.map((tab) => {
          const Section = SECTIONS[tab.id];
          return (
            <div
              key={tab.id}
              role="tabpanel"
              id={panelId(tab.id)}
              aria-labelledby={tabId(tab.id)}
              hidden={tab.id !== activeTab}
            >
              {tab.id === activeTab && <Section draft={draft} patch={patchDraft} />}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
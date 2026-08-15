"use client";

import { useState } from "react";

import {
  CONTRACT_TERM_LABEL,
  GENDER_PREFERENCE_LABEL,
  OCCUPANCY_COUNT_LABEL,
  ROOM_TYPE_LABEL,
} from "@/domains/room";
import type { FilterTab, RoomFilter } from "@/features/filter-rooms";
import {
  amountRangeLabel,
  dateChipLabel,
  isRoomFilterActive,
  regionChipLabel,
  RoomFilterModal,
  useRoomFilter,
} from "@/features/filter-rooms";
import { Icon } from "@/shared/ui/icons";

import { FilterChip } from "./filter-chip";

/** 필터 칩(=전체 필터 진입) 식별자 */
const ALL_CHIP = "__all__";

function roomTypeChipLabel(filter: RoomFilter): string | null {
  const [first, ...rest] = filter.roomTypes;
  if (first === undefined) return null;
  return rest.length === 0 ? ROOM_TYPE_LABEL[first] : `${ROOM_TYPE_LABEL[first]} 외 ${rest.length}`;
}

/**
 * 칩 정의: 어떤 필드를 참조하고(활성 판정), 선택 시 어떤 요약을 보여줄지(summary).
 *
 * 목록 칩은 피그마 문구대로 둡니다(모달 탭은 "매물 유형", 목록 칩은 "건물 유형" — §11).
 * 보증금·월 이용료는 `price` 탭 하나로, 이용 인원·전용 성별은 `occupancy` 탭 하나로
 * 모입니다. 어느 칩을 눌러도 같은 탭이 열리고 두 조건을 함께 설정합니다(§6.4).
 */
const CHIPS: readonly {
  key: string;
  label: string;
  tab: FilterTab;
  summary: (filter: RoomFilter) => string | null;
}[] = [
  { key: "region", label: "지역", tab: "region", summary: (f) => regionChipLabel(f) },
  { key: "moveIn", label: "입주 희망일", tab: "moveIn", summary: (f) => dateChipLabel(f.moveInDate) },
  {
    key: "term",
    label: "계약 기간",
    tab: "term",
    summary: (f) => (f.minTerm ? CONTRACT_TERM_LABEL[f.minTerm] : null),
  },
  {
    key: "deposit",
    label: "보증금",
    tab: "price",
    summary: (f) => amountRangeLabel(f.depositMin, f.depositMax),
  },
  {
    key: "rent",
    label: "월 이용료",
    tab: "price",
    summary: (f) => amountRangeLabel(f.rentMin, f.rentMax),
  },
  { key: "type", label: "건물 유형", tab: "type", summary: roomTypeChipLabel },
  {
    key: "people",
    label: "이용 인원",
    tab: "occupancy",
    summary: (f) => (f.people ? OCCUPANCY_COUNT_LABEL[f.people] : null),
  },
  {
    key: "gender",
    label: "전용 성별",
    tab: "occupancy",
    summary: (f) => (f.gender ? GENDER_PREFERENCE_LABEL[f.gender] : null),
  },
];

/**
 * 필터 칩 바 (Figma: 매물검색필터 1067:43383)
 *
 * 칩을 누르면 지정된 탭으로 필터 모달을 엽니다. 모달은 열려 있을 때만 마운트해 초안이
 * 매번 새 스냅샷으로 시작하게 합니다(§7-1). "완료"는 push로 커밋(뒤로가기 복원), 닫기는
 * 초안 폐기입니다. 조건이 설정된 칩은 요약 값을 라벨로 보여줍니다(§6.3).
 */
export function RoomFilterBar({ filter }: { filter: RoomFilter }) {
  const { commitFilter, resetFilter } = useRoomFilter(filter);
  const [open, setOpen] = useState(false);
  const [openedChip, setOpenedChip] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>("region");

  const openModal = (tab: FilterTab, chipKey: string) => {
    setActiveTab(tab);
    setOpenedChip(chipKey);
    setOpen(true);
  };

  const active = isRoomFilterActive(filter);

  return (
    <div className="mb-6 flex flex-col gap-3">
      <div className="flex items-center gap-2 overflow-x-auto">
        <FilterChip
          label="필터"
          active={active}
          expanded={open && openedChip === ALL_CHIP}
          leftIcon={<Icon name="filter_alt" size={16} />}
          onClick={() => openModal("region", ALL_CHIP)}
        />
        <span className="h-4 w-px shrink-0 bg-grayscale-200" aria-hidden="true" />
        {CHIPS.map((chip) => {
          const summary = chip.summary(filter);
          return (
            <FilterChip
              key={chip.key}
              label={summary ?? chip.label}
              active={summary !== null}
              expanded={open && openedChip === chip.key}
              onClick={() => openModal(chip.tab, chip.key)}
            />
          );
        })}
      </div>

      {active && (
        <button
          type="button"
          onClick={resetFilter}
          className="inline-flex items-center gap-1 self-start text-label-1 font-medium text-grayscale-400 transition-colors hover:text-grayscale-500 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <Icon name="refresh" size={16} aria-hidden />
          초기화하고 전체 매물 보기
        </button>
      )}

      {open && (
        <RoomFilterModal
          initialTab={activeTab}
          filter={filter}
          onClose={() => setOpen(false)}
          onApply={(next) => {
            commitFilter(next);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}
"use client";

import { useId } from "react";

import type { RoomType } from "@/domains/room";
import { ROOM_TYPE_OPTIONS } from "@/domains/room";
import { ChipNormal } from "@/shared/ui/chip-normal";

import type { RoomFilter } from "../../model/room-filter";
import { SectionHeader } from "../section-header";

interface SectionProps {
  draft: RoomFilter;
  patch: (partial: Partial<RoomFilter>) => void;
}

/**
 * 매물 유형 (다중 선택)
 *
 * ChipField 대신 SectionHeader + ChipNormal을 직접 조합합니다 — 다른 섹션과 동일하게
 * 헤더에 "초기화"를 두기 위함입니다(ChipField에는 초기화 슬롯이 없음).
 */
export function RoomTypeSection({ draft, patch }: SectionProps) {
  const titleId = useId();

  const toggle = (value: RoomType) => {
    const next = draft.roomTypes.includes(value)
      ? draft.roomTypes.filter((item) => item !== value)
      : [...draft.roomTypes, value];
    patch({ roomTypes: next });
  };

  return (
    <div>
      <SectionHeader
        title="매물 유형"
        titleId={titleId}
        canReset={draft.roomTypes.length > 0}
        onReset={() => patch({ roomTypes: [] })}
      />
      <div role="group" aria-labelledby={titleId} className="flex flex-wrap gap-1.5">
        {ROOM_TYPE_OPTIONS.map((option) => (
          <ChipNormal
            key={option.value}
            shape="round"
            size="m"
            selected={draft.roomTypes.includes(option.value)}
            onClick={() => toggle(option.value)}
          >
            {option.label}
          </ChipNormal>
        ))}
      </div>
    </div>
  );
}
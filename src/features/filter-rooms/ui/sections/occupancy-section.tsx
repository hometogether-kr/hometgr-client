"use client";

import { useId } from "react";

import { GENDER_PREFERENCE_OPTIONS, OCCUPANCY_COUNT_OPTIONS } from "@/domains/room";

import type { RoomFilter } from "../../model/room-filter";
import { SectionHeader } from "../section-header";
import { RadioOptionGroup } from "./radio-option-group";

interface SectionProps {
  draft: RoomFilter;
  patch: (partial: Partial<RoomFilter>) => void;
}

/** 이용 인원 + 전용 성별 — 한 탭에서 두 조건을 함께 설정 (설계 §6.4) */
export function OccupancySection({ draft, patch }: SectionProps) {
  const peopleId = useId();
  const genderId = useId();
  return (
    <div className="flex flex-col gap-5">
      <div>
        <SectionHeader
          title="이용 인원"
          titleId={peopleId}
          canReset={draft.people !== null}
          onReset={() => patch({ people: null })}
        />
        <RadioOptionGroup
          name="filter-people"
          ariaLabelledby={peopleId}
          options={OCCUPANCY_COUNT_OPTIONS}
          value={draft.people}
          onChange={(value) => patch({ people: value })}
        />
      </div>
      <div>
        <SectionHeader
          title="성별"
          titleId={genderId}
          canReset={draft.gender !== null}
          onReset={() => patch({ gender: null })}
        />
        <RadioOptionGroup
          name="filter-gender"
          ariaLabelledby={genderId}
          options={GENDER_PREFERENCE_OPTIONS}
          value={draft.gender}
          onChange={(value) => patch({ gender: value })}
        />
      </div>
    </div>
  );
}
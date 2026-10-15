"use client";

import { useId } from "react";

import { GENDER_PREFERENCE_OPTIONS } from "@/domains/room";

import type { RoomFilter } from "../../model/room-filter";
import { SectionHeader } from "../section-header";
import { RadioOptionGroup } from "./radio-option-group";

interface GenderSectionProps {
  draft: RoomFilter;
  patch: (partial: Partial<RoomFilter>) => void;
}

export function GenderSection({ draft, patch }: GenderSectionProps) {
  const titleId = useId();
  return (
    <div>
      <SectionHeader
        title="성별"
        titleId={titleId}
        className="mb-4"
        canReset={draft.gender !== null}
        onReset={() => patch({ gender: null })}
      />
      <RadioOptionGroup
        name="filter-gender"
        ariaLabelledby={titleId}
        options={GENDER_PREFERENCE_OPTIONS}
        value={draft.gender}
        onChange={(value) => patch({ gender: value })}
      />
    </div>
  );
}

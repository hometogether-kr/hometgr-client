"use client";

import { useId } from "react";

import { CONTRACT_TERM_OPTIONS } from "@/domains/room";

import type { RoomFilter } from "../../model/room-filter";
import { SectionHeader } from "../section-header";
import { RadioOptionGroup } from "./radio-option-group";

interface SectionProps {
  draft: RoomFilter;
  patch: (partial: Partial<RoomFilter>) => void;
}

/** 최소 계약 기간 (단일 선택) */
export function TermSection({ draft, patch }: SectionProps) {
  const titleId = useId();
  return (
    <div>
      <SectionHeader
        title="최소 계약 기간"
        titleId={titleId}
        canReset={draft.minTerm !== null}
        onReset={() => patch({ minTerm: null })}
      />
      <RadioOptionGroup
        name="filter-term"
        ariaLabelledby={titleId}
        options={CONTRACT_TERM_OPTIONS}
        value={draft.minTerm}
        onChange={(value) => patch({ minTerm: value })}
      />
    </div>
  );
}
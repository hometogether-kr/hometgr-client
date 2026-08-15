"use client";

import { useId } from "react";

import { formatAmount, parseAmount } from "@/shared/lib/format-amount";
import { TextField } from "@/shared/ui/text-field";

import type { RoomFilter } from "../../model/room-filter";
import { getRoomFilterErrors } from "../../model/room-filter";
import { SectionHeader } from "../section-header";

interface SectionProps {
  draft: RoomFilter;
  patch: (partial: Partial<RoomFilter>) => void;
}

interface AmountRangeProps {
  label: string;
  min: number | null;
  max: number | null;
  minPlaceholder: string;
  maxPlaceholder: string;
  error: string | null;
  onChange: (min: number | null, max: number | null) => void;
}

/**
 * 최소~최대 금액 한 쌍. 상태·입력·필터 비교는 모두 원 단위, 화면은 콤마 문자열입니다
 * (설계 §4-5b). 단위는 각 입력 뒤 `원` 접미사로 표시합니다.
 * 에러는 "최대" 필드에 실어 빨간 테두리 + `aria-describedby` 연결을 한 번만 냅니다
 * (TextField 에러 슬롯 재사용). `inputMode="numeric"`로 모바일 숫자 키패드.
 */
function AmountRange({
  label,
  min,
  max,
  minPlaceholder,
  maxPlaceholder,
  error,
  onChange,
}: AmountRangeProps) {
  return (
    <div>
      <p className="mb-2 text-sm leading-[1.4] font-medium text-grayscale-600">{label}</p>
      <div className="flex items-start gap-2">
        <TextField
          className="flex-1"
          size="m"
          inputMode="numeric"
          placeholder={minPlaceholder}
          aria-label={`${label} 최소`}
          value={formatAmount(min)}
          onChange={(event) => onChange(parseAmount(event.target.value), max)}
        />
        <span className="shrink-0 pt-3 text-grayscale-600">원</span>
        <span className="shrink-0 pt-3 text-grayscale-400">~</span>
        <TextField
          className="flex-1"
          size="m"
          inputMode="numeric"
          placeholder={maxPlaceholder}
          aria-label={`${label} 최대`}
          error={error ?? undefined}
          value={formatAmount(max)}
          onChange={(event) => onChange(min, parseAmount(event.target.value))}
        />
        <span className="shrink-0 pt-3 text-grayscale-600">원</span>
      </div>
    </div>
  );
}

/** 보증금 + 월세 (각 최소~최대, 원 단위) — 한 탭에서 두 조건을 함께 설정 (설계 §6.4) */
export function PriceSection({ draft, patch }: SectionProps) {
  const titleId = useId();
  const errors = getRoomFilterErrors(draft);
  const canReset =
    draft.depositMin !== null ||
    draft.depositMax !== null ||
    draft.rentMin !== null ||
    draft.rentMax !== null;

  return (
    <div>
      <SectionHeader
        title="보증금·월세"
        titleId={titleId}
        canReset={canReset}
        onReset={() => patch({ depositMin: null, depositMax: null, rentMin: null, rentMax: null })}
      />
      <div aria-labelledby={titleId} className="flex flex-col gap-6">
        <AmountRange
          label="보증금"
          min={draft.depositMin}
          max={draft.depositMax}
          minPlaceholder="5,000,000"
          maxPlaceholder="10,000,000"
          error={errors.deposit}
          onChange={(min, max) => patch({ depositMin: min, depositMax: max })}
        />
        <AmountRange
          label="월세"
          min={draft.rentMin}
          max={draft.rentMax}
          minPlaceholder="500,000"
          maxPlaceholder="1,000,000"
          error={errors.rent}
          onChange={(min, max) => patch({ rentMin: min, rentMax: max })}
        />
      </div>
    </div>
  );
}
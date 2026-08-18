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
  /** aria-label 접두사 ("보증금"·"월세") — 화면 라벨은 섹션 헤더가 담당합니다(D17) */
  label: string;
  min: number | null;
  max: number | null;
  minPlaceholder: string;
  maxPlaceholder: string;
  error: string | null;
  onChange: (min: number | null, max: number | null) => void;
}

/** 최소/최대 입력 옆 라벨·단위 텍스트 (16px Medium G700 — D20·D22) */
const ADORN = "shrink-0 text-body-1 font-medium text-grayscale-700";

/**
 * 최소~최대 금액 한 쌍 (회색 카드 한 행 — D21).
 *
 * 상태·입력·필터 비교는 모두 원 단위, 화면은 콤마 문자열입니다(설계 §4-5b). 최소/최대는
 * 입력 왼쪽 바깥 라벨(D20), 단위는 입력 뒤 `원`(D18)으로 표시합니다. 에러는 "최대" 필드에
 * 실어 빨간 테두리 + `aria-describedby`를 한 번만 냅니다(TextField 에러 슬롯 재사용).
 * 에러 상태 위치·색은 Figma 미설계라 임시입니다(QA §5-2).
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
    <div className="flex items-center gap-3 rounded-lg bg-grayscale-50 p-4">
      <div className="flex flex-1 items-center gap-2">
        <span className={ADORN}>최소</span>
        <TextField
          className="flex-1"
          size="m"
          inputMode="numeric"
          placeholder={minPlaceholder}
          aria-label={`${label} 최소`}
          value={formatAmount(min)}
          onChange={(event) => onChange(parseAmount(event.target.value), max)}
        />
        <span className={ADORN}>원</span>
      </div>
      <span className={ADORN}>~</span>
      <div className="flex flex-1 items-center gap-2">
        <span className={ADORN}>최대</span>
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
        <span className={ADORN}>원</span>
      </div>
    </div>
  );
}

/**
 * 보증금 · 월세 — Figma는 각각 독립 섹션(헤더 + 초기화 + 회색 카드)입니다(D17). 한 탭에서
 * 두 조건을 함께 설정하되, 초기화는 각 쌍만 비웁니다.
 */
export function PriceSection({ draft, patch }: SectionProps) {
  const depositId = useId();
  const rentId = useId();
  const errors = getRoomFilterErrors(draft);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <SectionHeader
          title="보증금"
          titleId={depositId}
          canReset={draft.depositMin !== null || draft.depositMax !== null}
          onReset={() => patch({ depositMin: null, depositMax: null })}
        />
        <div aria-labelledby={depositId}>
          <AmountRange
            label="보증금"
            min={draft.depositMin}
            max={draft.depositMax}
            minPlaceholder="5,000,000"
            maxPlaceholder="10,000,000"
            error={errors.deposit}
            onChange={(min, max) => patch({ depositMin: min, depositMax: max })}
          />
        </div>
      </div>
      <div>
        <SectionHeader
          title="월세"
          titleId={rentId}
          canReset={draft.rentMin !== null || draft.rentMax !== null}
          onReset={() => patch({ rentMin: null, rentMax: null })}
        />
        <div aria-labelledby={rentId}>
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
    </div>
  );
}
"use client";

import { useId, useState } from "react";

import { REGIONS } from "@/domains/region";
import { cn } from "@/shared/lib/cn";
import { Icon } from "@/shared/ui/icons";

import type { RoomFilter } from "../../model/room-filter";
import { SectionHeader } from "../section-header";

interface SectionProps {
  draft: RoomFilter;
  patch: (partial: Partial<RoomFilter>) => void;
}

/**
 * 지역 (아코디언 단일 선택 — 설계 §5·§11)
 *
 * 서울만 시·군·구까지, 그 외 시·도는 시·도 단위까지입니다. 선택은 sido + sigungu 조합으로
 * 저장합니다: "서울 전체" → sido="11", sigungu=null / "강남구" → sido="11", sigungu="11680".
 * 시·도는 한 번에 하나만 펼칩니다(처음엔 선택된 시·도를 펼침). 선택 표시는 버튼 +
 * aria-pressed로 두었고, 라디오 로빙까지의 완전한 접근성은 디자인 QA에서 다듬습니다.
 */
export function RegionSection({ draft, patch }: SectionProps) {
  const titleId = useId();
  const [expanded, setExpanded] = useState<string | null>(draft.sido);

  const selectSido = (sido: string) => patch({ sido, sigungu: null });
  const selectSigungu = (sido: string, sigungu: string) => patch({ sido, sigungu });

  const isSidoAll = (sido: string) => draft.sido === sido && draft.sigungu === null;
  const isSigungu = (sigungu: string) => draft.sigungu === sigungu;

  const rowClass = (selected: boolean) =>
    cn(
      "flex w-full items-center justify-between py-3 text-body-1 transition-colors",
      "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none",
      selected ? "font-semibold text-primary-600" : "text-grayscale-800",
    );

  return (
    <div>
      <SectionHeader
        title="지역"
        titleId={titleId}
        canReset={draft.sido !== null}
        onReset={() => patch({ sido: null, sigungu: null })}
      />
      <ul aria-labelledby={titleId} className="flex flex-col">
        {REGIONS.map((sido) => {
          const hasSub = sido.sigungu.length > 0;

          if (!hasSub) {
            return (
              <li key={sido.code}>
                <button
                  type="button"
                  aria-pressed={isSidoAll(sido.code)}
                  onClick={() => selectSido(sido.code)}
                  className={rowClass(isSidoAll(sido.code))}
                >
                  {sido.name}
                  {isSidoAll(sido.code) && <Icon name="check" size={20} aria-hidden />}
                </button>
              </li>
            );
          }

          const isExpanded = expanded === sido.code;
          return (
            <li key={sido.code}>
              <button
                type="button"
                aria-expanded={isExpanded}
                onClick={() => setExpanded(isExpanded ? null : sido.code)}
                className={cn(
                  "flex w-full items-center justify-between py-3 text-body-1 transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none",
                  draft.sido === sido.code
                    ? "font-semibold text-grayscale-900"
                    : "text-grayscale-800",
                )}
              >
                {sido.name}
                <Icon
                  name="keyboard_arrow_down"
                  size={20}
                  aria-hidden
                  className={cn("shrink-0 transition-transform", isExpanded && "rotate-180")}
                />
              </button>
              {isExpanded && (
                <ul className="flex flex-col border-b border-grayscale-100 pb-2 pl-3">
                  <li>
                    <button
                      type="button"
                      aria-pressed={isSidoAll(sido.code)}
                      onClick={() => selectSido(sido.code)}
                      className={rowClass(isSidoAll(sido.code))}
                    >
                      {sido.name} 전체
                      {isSidoAll(sido.code) && <Icon name="check" size={18} aria-hidden />}
                    </button>
                  </li>
                  {sido.sigungu.map((gu) => (
                    <li key={gu.code}>
                      <button
                        type="button"
                        aria-pressed={isSigungu(gu.code)}
                        onClick={() => selectSigungu(sido.code, gu.code)}
                        className={rowClass(isSigungu(gu.code))}
                      >
                        {gu.name}
                        {isSigungu(gu.code) && <Icon name="check" size={18} aria-hidden />}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
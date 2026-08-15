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

/** 시·도 행 공통 크롬 — G50 배경 + Headline 1 Medium + 하단 보더 (D10·D12) */
const SIDO_ROW =
  "flex w-full items-center justify-between border-b border-grayscale-200 bg-grayscale-50 py-3 pr-4 pl-5 text-headline-1 font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none focus-visible:ring-inset";

/**
 * 지역 (아코디언 단일 선택 — 설계 §5·§11)
 *
 * 서울만 시·군·구까지, 그 외 시·도는 시·도 단위까지입니다. 선택은 sido + sigungu 조합으로
 * 저장합니다: "서울 전체" → sido="11", sigungu=null / "강남구" → sido="11", sigungu="11680".
 * 시·군·구는 카드 안 2열 그리드로 펼치고(D7), 선택 셀은 primary-100/600 배경·텍스트로
 * 표시합니다(D8, 체크 아이콘 없음).
 *
 * 접근성: 단일 선택이지만 현재는 button + aria-pressed입니다. 2열 그리드에 맞는
 * role=radiogroup/radio + 로빙 tabindex 전환은 후속 a11y 과제로 남깁니다(QA §5-1).
 * 노출 목록·정렬 기준은 디자이너 확정 대기입니다(QA §5-5).
 */
export function RegionSection({ draft, patch }: SectionProps) {
  const titleId = useId();
  const [expanded, setExpanded] = useState<string | null>(draft.sido);

  const selectSido = (sido: string) => patch({ sido, sigungu: null });
  const selectSigungu = (sido: string, sigungu: string) => patch({ sido, sigungu });

  const isSidoAll = (sido: string) => draft.sido === sido && draft.sigungu === null;
  const isSigungu = (sigungu: string) => draft.sigungu === sigungu;

  /** 시·군·구 셀 — 선택 primary-100/600(체크 없음), 미선택 G600 (D8·D11). 좌측 열만 우측 보더 */
  const cellClass = (selected: boolean, isLeftColumn: boolean) =>
    cn(
      "w-full border-t border-grayscale-200 p-5 text-left text-headline-1 font-medium transition-colors",
      "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none focus-visible:ring-inset",
      isLeftColumn && "border-r border-grayscale-200",
      selected ? "bg-primary-100 text-primary-600" : "text-grayscale-600",
    );

  return (
    <div>
      <SectionHeader
        title="원하는 지역을 선택하세요."
        titleId={titleId}
        resetLabel="지역 초기화"
        canReset={draft.sido !== null}
        onReset={() => patch({ sido: null, sigungu: null })}
      />
      <ul aria-labelledby={titleId} className="flex flex-col">
        {REGIONS.map((sido) => {
          const hasSub = sido.sigungu.length > 0;

          // 하위가 없는 시·도(서울 외)는 그 자체가 선택 대상인 잎 행입니다.
          if (!hasSub) {
            const selected = isSidoAll(sido.code);
            return (
              <li key={sido.code}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => selectSido(sido.code)}
                  className={cn(SIDO_ROW, selected ? "text-primary-600" : "text-grayscale-800")}
                >
                  {sido.name}
                </button>
              </li>
            );
          }

          const isExpanded = expanded === sido.code;
          // "○○ 전체" + 시·군·구를 하나의 셀 배열로 만들어 인덱스로 좌/우 열을 판정합니다.
          const cells = [
            {
              key: `${sido.code}-all`,
              name: `${sido.name} 전체`,
              selected: isSidoAll(sido.code),
              onClick: () => selectSido(sido.code),
            },
            ...sido.sigungu.map((gu) => ({
              key: gu.code,
              name: gu.name,
              selected: isSigungu(gu.code),
              onClick: () => selectSigungu(sido.code, gu.code),
            })),
          ];

          return (
            <li key={sido.code}>
              <button
                type="button"
                aria-expanded={isExpanded}
                onClick={() => setExpanded(isExpanded ? null : sido.code)}
                className={cn(SIDO_ROW, "text-grayscale-800")}
              >
                {sido.name}
                <span className="flex size-12 shrink-0 items-center justify-center">
                  <Icon
                    name="keyboard_arrow_down"
                    size={24}
                    aria-hidden
                    className={cn("transition-transform", isExpanded && "rotate-180")}
                  />
                </span>
              </button>
              {isExpanded && (
                <div className="overflow-hidden rounded-lg border border-grayscale-200">
                  <ul className="grid grid-cols-2">
                    {cells.map((cell, index) => (
                      <li key={cell.key}>
                        <button
                          type="button"
                          aria-pressed={cell.selected}
                          onClick={cell.onClick}
                          className={cellClass(cell.selected, index % 2 === 0)}
                        >
                          {cell.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
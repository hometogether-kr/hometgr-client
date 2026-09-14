"use client";

import { useId, useState } from "react";

import { REGIONS, SIDO_ETC } from "@/domains/region";
import { cn } from "@/shared/lib/cn";
import { Icon } from "@/shared/ui/icons";

import type { RoomFilter } from "../../model/room-filter";
import { SectionHeader } from "../section-header";

interface SectionProps {
  draft: RoomFilter;
  patch: (partial: Partial<RoomFilter>) => void;
}

/**
 * 시·도 행 공통 크롬 — G50 배경 + Headline 1 Medium + 4면 보더 카드 (QA §1-4)
 *
 * Figma의 시·도 행은 하단 보더로 이어 붙인 리스트가 아니라 독립 카드(4면 보더 + 10px
 * 라운드)입니다. 현재 노출 대상이 서울 하나뿐이라 리스트가 아니라 카드가 되므로 이 스타일이
 * 자연스럽습니다.
 */
const SIDO_ROW =
  "flex w-full items-center justify-between rounded-[10px] border border-grayscale-200 bg-grayscale-50 py-3 pr-4 pl-5 text-headline-1 font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none focus-visible:ring-inset";

/**
 * 지역 (아코디언 단일 선택 — 설계 §5·§11 / QA A·B)
 *
 * 현재는 서울만 노출하고, 서울 외 전체는 "기타"(SIDO_ETC)로 묶어 펼침 그리드의 마지막
 * 전폭 셀에 둡니다. 선택은 sido + sigungu 조합으로 저장합니다:
 * "서울 전체" → sido="11", sigungu=null / "강남구" → sido="11", sigungu="11680" /
 * "기타" → sido="etc", sigungu=null.
 *
 * 시·군·구는 카드 안 2열 그리드로 펼치고(D7), 선택 셀은 primary-100/600 배경·텍스트로
 * 표시합니다(D8, 체크 아이콘 없음).
 *
 * 접근성: 단일 선택이지만 현재는 button + aria-pressed입니다. 2열 그리드에 맞는
 * role=radiogroup/radio + 로빙 tabindex 전환은 후속 a11y 과제로 남깁니다(QA §5-1).
 *
 * 참고: 시·도가 다시 늘어날 때를 위한 "하위 없는 잎 행" 분기는 현재 서울만이라 호출되지
 * 않지만, 되살릴 코드이므로 유지합니다.
 */
export function RegionSection({ draft, patch }: SectionProps) {
  const titleId = useId();
  // 선택이 있으면(서울 전체·구·기타 무엇이든) 서울을 펼친 상태로 진입합니다.
  const [expanded, setExpanded] = useState<string | null>(draft.sido === null ? null : "11");

  const selectSido = (sido: string) => patch({ sido, sigungu: null });
  const selectSigungu = (sido: string, sigungu: string) => patch({ sido, sigungu });

  const isSidoAll = (sido: string) => draft.sido === sido && draft.sigungu === null;
  const isSigungu = (sigungu: string) => draft.sigungu === sigungu;

  /**
   * 시·군·구 셀 — 선택 primary-100/600(체크 없음), 미선택 G600 (D8·D11).
   * 좌측 열만 우측 보더(전폭 셀은 좌우 구분 없음).
   */
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
      <ul aria-labelledby={titleId} className="flex flex-col gap-2">
        {REGIONS.map((sido) => {
          const hasSub = sido.sigungu.length > 0;

          // 하위가 없는 시·도(현재 미사용 — 시·도 확장 시 되살릴 잎 행)는 그 자체가 선택 대상.
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
          // "○○ 전체" + 시·군·구 + "기타"를 하나의 셀 배열로 만들어 인덱스로 좌/우 열을 판정합니다.
          // "기타"는 데이터(sido.sigungu)에 넣지 않고 여기서만 주입합니다 — 데이터에 넣으면
          // "서울의 하위 구"라는 잘못된 의미가 박힙니다.
          const cells = [
            {
              key: `${sido.code}-all`,
              name: `${sido.name} 전체`,
              selected: isSidoAll(sido.code),
              onClick: () => selectSido(sido.code),
              fullWidth: false,
            },
            ...sido.sigungu.map((gu) => ({
              key: gu.code,
              name: gu.name,
              selected: isSigungu(gu.code),
              onClick: () => selectSigungu(sido.code, gu.code),
              fullWidth: false,
            })),
            {
              key: SIDO_ETC,
              name: "기타",
              selected: draft.sido === SIDO_ETC,
              onClick: () => patch({ sido: SIDO_ETC, sigungu: null }),
              fullWidth: true,
            },
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
                <div className="mt-2 overflow-hidden rounded-lg border border-grayscale-200">
                  <ul className="grid grid-cols-2">
                    {cells.map((cell, index) => (
                      <li key={cell.key} className={cell.fullWidth ? "col-span-2" : undefined}>
                        <button
                          type="button"
                          aria-pressed={cell.selected}
                          onClick={cell.onClick}
                          className={cellClass(cell.selected, !cell.fullWidth && index % 2 === 0)}
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
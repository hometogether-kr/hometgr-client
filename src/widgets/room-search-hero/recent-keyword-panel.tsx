"use client";

import { cn } from "@/shared/lib/cn";
import { BtnUnderline } from "@/shared/ui/btn-underline";
import { Divider } from "@/shared/ui/divider";
import { Icon } from "@/shared/ui/icons";

interface RecentKeywordPanelProps {
  keywords: string[];
  /** 키보드로 하이라이트된 항목 인덱스. -1이면 아무것도 선택 안 됨 */
  activeIndex: number;
  listId: string;
  optionId: (index: number) => string;
  onSelect: (keyword: string) => void;
  onRemove: (keyword: string) => void;
  onClearAll: () => void;
  onActiveIndexChange: (index: number) => void;
}

/**
 * 최근 검색어 패널 (Figma: node 1067:44157)
 *
 * 입력창 포커스 시 아래로 펼쳐지는 플로팅 리스트입니다. 콤보박스의 팝업이므로
 * `role="listbox"`이고, 포커스는 입력창에 머무른 채 하이라이트만 `aria-activedescendant`로
 * 가리킵니다 — 항목 자체는 포커스를 받지 않습니다(입력창의 onKeyDown이 이동을 처리).
 *
 * 항목 클릭·삭제 버튼은 `mousedown`에서 `preventDefault`합니다. 그래야 입력창이 포커스를
 * 잃어 패널이 닫히기 전에 동작이 실행됩니다(정렬 드롭다운과 같은 방식).
 */
export function RecentKeywordPanel({
  keywords,
  activeIndex,
  listId,
  optionId,
  onSelect,
  onRemove,
  onClearAll,
  onActiveIndexChange,
}: RecentKeywordPanelProps) {
  return (
    <div className="absolute top-full right-0 left-0 z-20 mt-3 overflow-hidden rounded-2xl border border-grayscale-200 bg-white shadow-dropdown">
      <div className="flex items-start justify-between px-7 py-6">
        <span className="text-heading-2 font-semibold text-grayscale-900">최근 검색어</span>
        <BtnUnderline
          size="14"
          tone="default"
          className="px-1.5 py-1"
          onMouseDown={(event) => event.preventDefault()}
          onClick={onClearAll}
        >
          모두 삭제
        </BtnUnderline>
      </div>
      <div className="px-7">
        <Divider />
      </div>
      <ul id={listId} role="listbox" aria-label="최근 검색어">
        {keywords.map((keyword, index) => {
          const isActive = index === activeIndex;
          return (
            <li
              key={keyword}
              id={optionId(index)}
              role="option"
              aria-selected={isActive}
              onMouseEnter={() => onActiveIndexChange(index)}
              className={cn(
                "flex h-16 items-center justify-between px-7 transition-colors",
                isActive && "bg-grayscale-70",
              )}
            >
              <button
                type="button"
                // mousedown이 입력창 blur→패널 닫힘보다 먼저 실행되도록 preventDefault
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onSelect(keyword)}
                className="-mx-2 flex min-w-0 flex-1 items-center rounded-lg px-2 py-1 text-left text-headline-1 text-grayscale-900 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <span className="truncate">{keyword}</span>
              </button>
              <button
                type="button"
                aria-label={`${keyword} 삭제`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onRemove(keyword)}
                className="shrink-0 rounded-full p-2 text-grayscale-800 transition-colors hover:text-grayscale-700 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <Icon name="close" size={16} />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
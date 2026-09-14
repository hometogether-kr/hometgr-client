"use client";

import type { KeyboardEvent } from "react";
import { useId, useRef, useState } from "react";

import { cn } from "@/shared/lib/cn";
import { useOutsideClick } from "@/shared/lib/hooks";
import { Icon } from "@/shared/ui/icons";

export interface DropdownSOption<T extends string> {
  value: T;
  label: string;
}

export interface DropdownSProps<T extends string> {
  options: readonly DropdownSOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** 리스트 정렬 기준. 정렬 드롭다운은 우측 정렬이므로 "end" */
  align?: "start" | "end";
  /** 트리거 접근성 이름 (예: "정렬 기준") */
  "aria-label"?: string;
  className?: string;
}

/**
 * 칩형 드롭다운 (Figma: Dropdown_s, node 1067:42170)
 *
 * 기존 `shared/ui/dropdown`은 풀박스 셀렉트 트리거이고 키보드 처리가 없습니다. 이건
 * 칩형 트리거 + `shadow-dropdown` 플로팅 리스트에 ↑↓ 로빙·Enter 선택·Esc 닫기를 갖춘
 * 별도 컴포넌트입니다(설계 §6.5).
 *
 * WAI-ARIA select-only combobox 패턴: 포커스는 트리거에 머무르고, 하이라이트는
 * `aria-activedescendant`로 가리킵니다. 옵션 자체는 포커스를 받지 않으므로 리스트 항목의
 * 키 이벤트는 트리거의 onKeyDown이 대신 처리합니다(li에 별도 키 핸들러가 필요 없습니다).
 */
export function DropdownS<T extends string>({
  options,
  value,
  onChange,
  align = "start",
  "aria-label": ariaLabel,
  className,
}: DropdownSProps<T>) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const baseId = useId();
  const listId = `${baseId}-list`;
  const optionId = (index: number) => `${baseId}-opt-${index}`;

  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const selectedLabel = options[selectedIndex]?.label ?? "";

  useOutsideClick(rootRef, () => setOpen(false), open);

  const openList = (index: number) => {
    setActiveIndex(index);
    setOpen(true);
  };

  const commit = (index: number) => {
    const option = options[index];
    if (option) onChange(option.value);
    setOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (open) setActiveIndex((prev) => Math.min(prev + 1, options.length - 1));
        else openList(selectedIndex);
        break;
      case "ArrowUp":
        event.preventDefault();
        if (open) setActiveIndex((prev) => Math.max(prev - 1, 0));
        else openList(selectedIndex);
        break;
      case "Home":
        if (open) {
          event.preventDefault();
          setActiveIndex(0);
        }
        break;
      case "End":
        if (open) {
          event.preventDefault();
          setActiveIndex(options.length - 1);
        }
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (open) commit(activeIndex);
        else openList(selectedIndex);
        break;
      case "Escape":
        if (open) {
          event.preventDefault();
          setOpen(false);
        }
        break;
      case "Tab":
        if (open) setOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div ref={rootRef} className={cn("relative inline-flex", className)}>
      <button
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        aria-activedescendant={open ? optionId(activeIndex) : undefined}
        onClick={() => (open ? setOpen(false) : openList(selectedIndex))}
        onKeyDown={handleKeyDown}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-lg border border-grayscale-200 bg-white px-3 text-label-2 leading-normal font-medium text-grayscale-700 transition-colors",
          "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:outline-none",
          open && "border-grayscale-300",
        )}
      >
        <span className="whitespace-nowrap">{selectedLabel}</span>
        <Icon
          name="keyboard_arrow_down"
          size={16}
          className={cn("shrink-0 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={ariaLabel}
          className={cn(
            "absolute top-full z-20 mt-1 min-w-[140px] overflow-hidden rounded-lg bg-white py-1 shadow-dropdown",
            align === "end" ? "right-0" : "left-0",
          )}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isActive = index === activeIndex;
            return (
              <li
                key={option.value}
                id={optionId(index)}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => {
                  // mousedown이 트리거에서 포커스를 뺏어 blur→close 되는 것을 막습니다.
                  event.preventDefault();
                  commit(index);
                }}
                className={cn(
                  "cursor-pointer px-3 py-2 text-label-1 font-medium whitespace-nowrap transition-colors",
                  isActive ? "bg-grayscale-70 text-grayscale-700" : "text-grayscale-600",
                )}
              >
                {option.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
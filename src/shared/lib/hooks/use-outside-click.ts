"use client";

import type { RefObject } from "react";
import { useEffect } from "react";

/**
 * 요소 바깥을 눌렀을 때(mousedown) 콜백을 호출합니다.
 *
 * `dropdown.tsx`에 하드코딩돼 있던 아웃사이드 클릭 로직(mousedown + contains)을
 * 공용화한 것입니다. `dropdown`과 `dropdown-s`가 함께 씁니다. 딤 배경이 있는 모달은
 * `use-dialog-behavior`가 스크롤 잠금·포커스 트랩·ESC까지 처리하므로 이 훅으로 대체할
 * 수 없습니다 — 이 훅은 배경 없이 바깥 클릭만으로 닫는 플로팅 UI 전용입니다.
 *
 * click이 아니라 mousedown을 듣는 이유: 트리거 버튼의 click보다 먼저 발생해야
 * "열자마자 같은 클릭에 바로 닫힘"을 피할 수 있습니다.
 *
 * `enabled`가 false면 리스너를 붙이지 않습니다 — 닫혀 있는 동안 document에 리스너를
 * 남겨두지 않으려는 것입니다.
 */
export function useOutsideClick<T extends HTMLElement>(
  ref: RefObject<T | null>,
  onOutside: () => void,
  enabled = true,
): void {
  useEffect(() => {
    if (!enabled) return;

    const handle = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onOutside();
      }
    };

    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [ref, onOutside, enabled]);
}
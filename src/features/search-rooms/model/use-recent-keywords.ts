"use client";

import { useSyncExternalStore } from "react";
import { z } from "zod";

/** localStorage 키 — 다른 도메인 값과 충돌하지 않도록 네임스페이스를 붙입니다 */
const STORAGE_KEY = "hometgr.recentRoomKeywords";
/** 최근 검색어 최대 보관 개수 */
const MAX_KEYWORDS = 10;

/**
 * 다른 버전이 써둔 값이 있을 수 있어 `safeParse`로 방어적으로 읽습니다(설계 §6.0c —
 * localStorage 경계는 `safeParse`). 문자열 배열이 아니면 통째로 버리고 빈 배열로 시작합니다.
 */
const recentKeywordsSchema = z.array(z.string());

/** 공백 정리 · 빈 값 제거 · 중복 제거(앞선 것 우선) · 최대 개수 컷 */
function normalize(keywords: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const keyword of keywords) {
    const trimmed = keyword.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    result.push(trimmed);
    if (result.length >= MAX_KEYWORDS) break;
  }
  return result;
}

/**
 * 최근 검색어는 서버 상태가 아니라 브라우저 로컬 저장소(외부 시스템)입니다. `useState` +
 * `useEffect`로 읽어오면 하이드레이션 불일치 또는 effect 내 setState 문제가 생기므로,
 * React가 외부 저장소 구독용으로 제공하는 `useSyncExternalStore`를 씁니다. 서버 스냅샷은
 * 항상 빈 배열이라 SSR·하이드레이션이 어긋나지 않고, 마운트 후 클라이언트 스냅샷으로
 * 자연스럽게 교체됩니다(설계 §6.6).
 *
 * 같은 탭의 쓰기는 `storage` 이벤트가 발생하지 않으므로 직접 리스너에 알립니다.
 */
const listeners = new Set<() => void>();
/** 서버·초기 스냅샷용 안정 참조 (매 호출 새 배열을 주면 무한 루프가 납니다) */
const EMPTY: string[] = [];

let cachedRaw: string | null = null;
let cachedValue: string[] = EMPTY;
let hasCache = false;

function getSnapshot(): string[] {
  if (typeof window === "undefined") return EMPTY;
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return EMPTY;
  }
  // 값이 그대로면 이전 참조를 재사용 — useSyncExternalStore가 안정 참조를 요구합니다.
  if (hasCache && raw === cachedRaw) return cachedValue;
  cachedRaw = raw;
  try {
    const parsed = raw ? recentKeywordsSchema.safeParse(JSON.parse(raw)) : null;
    cachedValue = parsed?.success ? normalize(parsed.data) : EMPTY;
  } catch {
    cachedValue = EMPTY;
  }
  hasCache = true;
  return cachedValue;
}

function getServerSnapshot(): string[] {
  return EMPTY;
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function writeKeywords(next: string[]): void {
  cachedValue = next;
  cachedRaw = JSON.stringify(next);
  hasCache = true;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, cachedRaw);
    } catch {
      // 사생활 보호 모드 등에서 저장이 막혀도 화면 동작은 막지 않습니다.
    }
  }
  listeners.forEach((listener) => listener());
}

/**
 * 최근 검색어 목록 (localStorage 동기화)
 *
 * 중복은 최신으로 승격합니다 — 같은 검색어를 다시 쓰면 목록 맨 앞으로 올라옵니다.
 */
export function useRecentKeywords() {
  const keywords = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addKeyword = (keyword: string) => {
    const trimmed = keyword.trim();
    if (!trimmed) return;
    // 정규화 과정에서 기존 중복이 제거되고 맨 앞에 다시 들어가 최신으로 승격됩니다.
    writeKeywords(normalize([trimmed, ...keywords]));
  };

  const removeKeyword = (keyword: string) => {
    writeKeywords(keywords.filter((item) => item !== keyword));
  };

  const clearKeywords = () => {
    writeKeywords(EMPTY);
  };

  return { keywords, addKeyword, removeKeyword, clearKeywords };
}
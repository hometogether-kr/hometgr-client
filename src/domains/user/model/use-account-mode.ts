"use client";

import { usePathname } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

import {
  ACCOUNT_MODE_HOME,
  type AccountMode,
  accountModeSchema,
  getPageAccountMode,
  isAccountModeHome,
  resolveAccountMode,
} from "./account-mode";
import { useSession } from "./use-session";

const MODE_CHANGE_EVENT = "hometgr:account-mode";
const VISITOR_KEY = "hometgr:account-mode:visitor";
const memoryModes = new Map<string, AccountMode>();

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(MODE_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(MODE_CHANGE_EVENT, onChange);
  };
}

function readMode(key: string): AccountMode | null {
  const memoryMode = memoryModes.get(key);
  if (memoryMode) return memoryMode;
  try {
    const parsed = accountModeSchema.safeParse(window.localStorage.getItem(key));
    return parsed.success ? parsed.data : (memoryModes.get(key) ?? null);
  } catch {
    return memoryModes.get(key) ?? null;
  }
}

function writeMode(key: string, mode: AccountMode) {
  if (readMode(key) === mode) return;
  try {
    window.localStorage.setItem(key, mode);
    memoryModes.delete(key);
  } catch {
    // 저장소가 차단되어도 현재 탭에서의 탐색은 유지합니다.
    memoryModes.set(key, mode);
  }
  window.dispatchEvent(new Event(MODE_CHANGE_EVENT));
}

export function useAccountMode() {
  const pathname = usePathname();
  const { session, isAuthenticated } = useSession();
  const userId = session.user?.id;
  const key = userId ? `hometgr:account-mode:${userId}` : VISITOR_KEY;
  const savedMode = useSyncExternalStore(
    subscribe,
    () => readMode(key),
    () => undefined,
  );
  const pageMode = getPageAccountMode(pathname);
  const mode = resolveAccountMode({ pageMode, savedMode });

  // URL을 통해 선택한 모드를 저장소와 동기화하여 공통 화면에서도 유지합니다.
  useEffect(() => {
    if (pageMode && (!isAuthenticated || userId)) writeMode(key, pageMode);
  }, [key, pageMode, isAuthenticated, userId]);

  const setMode = (nextMode: AccountMode) => writeMode(key, nextMode);

  return {
    mode,
    setMode,
    homeHref: ACCOUNT_MODE_HOME[mode],
    canSwitchMode: isAccountModeHome(pathname),
    // 탐색 메뉴는 세션 조회 실패·지연과 관계없이 사용할 수 있어야 합니다.
    isModeReady: pageMode !== null || savedMode !== undefined,
  };
}

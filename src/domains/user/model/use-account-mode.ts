"use client";

import { useSyncExternalStore } from "react";
import { z } from "zod";

import { useSession } from "./use-session";

const accountModeSchema = z.enum(["host", "guest"]);
export type AccountMode = z.infer<typeof accountModeSchema>;
export const ACCOUNT_MODE_LABELS: Record<AccountMode, string> = {
  host: "집주인 모드",
  guest: "게스트 모드",
};
const MODE_CHANGE_EVENT = "hometgr:account-mode";
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
  try {
    const parsed = accountModeSchema.safeParse(window.localStorage.getItem(key));
    return parsed.success ? parsed.data : (memoryModes.get(key) ?? null);
  } catch {
    return memoryModes.get(key) ?? null;
  }
}

// 화면 모드는 서버 권한과 별개이며, 계정별로 마지막 선택을 기억합니다.
export function useAccountMode() {
  const { session } = useSession();
  const user = session.user;
  const key = user ? `hometgr:account-mode:${user.id}` : null;
  const savedMode = useSyncExternalStore(
    subscribe,
    () => (key ? readMode(key) : null),
    () => null,
  );
  const mode = savedMode ?? user?.memberRole ?? "guest";

  const setMode = (nextMode: AccountMode) => {
    if (!key) return;
    memoryModes.set(key, nextMode);
    try {
      window.localStorage.setItem(key, nextMode);
    } catch {
      // 저장소가 차단되어도 현재 탭에서는 모드를 전환할 수 있습니다.
    }
    window.dispatchEvent(new Event(MODE_CHANGE_EVENT));
  };

  return { mode, setMode, canSwitchMode: Boolean(user) };
}

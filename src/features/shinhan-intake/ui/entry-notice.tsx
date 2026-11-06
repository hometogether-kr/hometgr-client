"use client";

import type { ReactNode } from "react";

import { useShinhanEntryAvailability } from "../model/entry-context";

export function ShinhanEntryNotice({ children }: { children: ReactNode }) {
  return useShinhanEntryAvailability()
    ? children
    : "신청 연결을 준비 중이에요. 잠시 후 다시 확인해 주세요.";
}

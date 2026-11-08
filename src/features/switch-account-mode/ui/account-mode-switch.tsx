"use client";

import Link from "next/link";

import { ACCOUNT_MODE_HOME, ACCOUNT_MODE_LABELS, useAccountMode } from "@/domains/user";

export function AccountModeSwitch() {
  const { mode, setMode, canSwitchMode } = useAccountMode();
  if (!canSwitchMode) return null;
  const nextMode = mode === "host" ? "guest" : "host";

  return (
    <Link
      href={ACCOUNT_MODE_HOME[nextMode]}
      onClick={() => setMode(nextMode)}
      aria-label={`현재 ${ACCOUNT_MODE_LABELS[mode]}, ${ACCOUNT_MODE_LABELS[nextMode]}로 전환`}
      className="inline-flex shrink-0 items-center rounded-lg border border-grayscale-200 px-2 py-2 text-xs font-semibold whitespace-nowrap text-grayscale-700 hover:bg-grayscale-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
    >
      {ACCOUNT_MODE_LABELS[nextMode]}로 전환
    </Link>
  );
}

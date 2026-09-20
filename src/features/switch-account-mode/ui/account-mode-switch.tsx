"use client";

import { ACCOUNT_MODE_LABELS, useAccountMode } from "@/domains/user";
import { Icon } from "@/shared/ui/icons";

export function AccountModeSwitch() {
  const { mode, setMode, canSwitchMode } = useAccountMode();
  if (!canSwitchMode) return null;
  const nextMode = mode === "host" ? "guest" : "host";

  return (
    <button
      type="button"
      onClick={() => setMode(nextMode)}
      aria-label={`현재 ${ACCOUNT_MODE_LABELS[mode]}, ${ACCOUNT_MODE_LABELS[nextMode]}로 전환`}
      className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-grayscale-200 px-2 py-2 text-xs font-semibold whitespace-nowrap text-grayscale-700 hover:bg-grayscale-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
    >
      <Icon name="sync_alt" size={16} />
      {ACCOUNT_MODE_LABELS[nextMode]}로 전환
    </button>
  );
}

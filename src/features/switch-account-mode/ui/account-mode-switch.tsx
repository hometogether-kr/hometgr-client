"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { ACCOUNT_MODE_HOME, ACCOUNT_MODE_LABELS, useAccountMode, useSession } from "@/domains/user";
import { ApiError } from "@/shared/api";
import { useToast } from "@/shared/ui/toast";

import { useSwitchMemberRole } from "../model/use-switch-member-role";

const SWITCH_CLASS_NAME =
  "relative inline-flex shrink-0 items-center rounded-lg border border-grayscale-200 px-2 py-2 text-xs font-semibold whitespace-nowrap text-grayscale-700 hover:bg-grayscale-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:cursor-wait disabled:opacity-60";

export function AccountModeSwitch() {
  const router = useRouter();
  const { mode, setMode, canSwitchMode } = useAccountMode();
  const { session, isAuthenticated, isLoading } = useSession();
  const { switchMemberRole, isSwitchingRole } = useSwitchMemberRole();
  const [isNavigating, startTransition] = useTransition();
  const { showToast } = useToast();
  if (!canSwitchMode) return null;
  const nextMode = mode === "host" ? "guest" : "host";
  const label = `${ACCOUNT_MODE_LABELS[nextMode]}로 전환`;
  const accessibleLabel = `현재 ${ACCOUNT_MODE_LABELS[mode]}, ${label}`;

  if (!isAuthenticated) {
    return (
      <Link
        href={ACCOUNT_MODE_HOME[nextMode]}
        onClick={() => setMode(nextMode)}
        aria-label={accessibleLabel}
        className={SWITCH_CLASS_NAME}
      >
        {label}
      </Link>
    );
  }

  const isBusy = isSwitchingRole || isNavigating;

  const handleSwitchRole = async () => {
    if (isBusy || isLoading || !session.user) return;
    try {
      await switchMemberRole(nextMode);
      startTransition(() => {
        setMode(nextMode);
        router.push(ACCOUNT_MODE_HOME[nextMode]);
        router.refresh();
      });
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : "회원 유형을 전환하지 못했습니다.", {
        variant: "error",
      });
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleSwitchRole()}
      disabled={isBusy || isLoading || !session.user}
      aria-busy={isBusy}
      aria-label={accessibleLabel}
      className={SWITCH_CLASS_NAME}
    >
      <span className={isBusy ? "invisible" : undefined}>{label}</span>
      {isBusy && (
        <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          전환 중...
        </span>
      )}
    </button>
  );
}

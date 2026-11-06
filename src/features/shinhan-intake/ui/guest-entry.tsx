"use client";

import { useRouter } from "next/navigation";

import { BtnCta, type BtnCtaProps } from "@/shared/ui/btn-cta";

import { SHINHAN_GUEST_BUDGET_PATH } from "../config/routes";
import { useShinhanEntryAvailability } from "../model/entry-context";
import { useShinhanIntake } from "../model/intake-context";
import type { ShinhanGuestBudgetValues } from "../model/intake-draft";

function useStartGuestIntake() {
  const router = useRouter();
  const { startGuestDraft } = useShinhanIntake();
  const available = useShinhanEntryAvailability();
  function startIntake(region = "", initialValues?: Partial<ShinhanGuestBudgetValues>) {
    if (!available) return;
    startGuestDraft("GUEST_BUDGET", region, initialValues);
    router.push(SHINHAN_GUEST_BUDGET_PATH);
  }
  return { available, startIntake };
}

interface GuestFormButtonProps extends Omit<BtnCtaProps, "onClick" | "disabled"> {
  initialValues?: Partial<ShinhanGuestBudgetValues>;
}

export function ShinhanGuestFormButton({ initialValues, ...props }: GuestFormButtonProps) {
  const { available, startIntake } = useStartGuestIntake();
  return <BtnCta {...props} disabled={!available} onClick={() => startIntake("", initialValues)} />;
}

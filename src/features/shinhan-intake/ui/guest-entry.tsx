"use client";

import { useRouter } from "next/navigation";
import type { ButtonHTMLAttributes } from "react";

import { BtnCta, type BtnCtaProps } from "@/shared/ui/btn-cta";

import { SHINHAN_GUEST_BUDGET_PATH } from "../config/routes";
import { useShinhanEntryAvailability } from "../model/entry-context";
import { shinhanGuestRegionSchema } from "../model/guest-conditions.schema";
import { useShinhanIntake } from "../model/intake-context";

function useStartGuestIntake() {
  const router = useRouter();
  const { startGuestDraft } = useShinhanIntake();
  const available = useShinhanEntryAvailability();
  function startIntake(region = "") {
    if (!available) return;
    startGuestDraft("GUEST_BUDGET", region);
    router.push(SHINHAN_GUEST_BUDGET_PATH);
  }
  return { available, startIntake };
}

type GuestFormButtonProps = Omit<BtnCtaProps, "onClick" | "disabled">;

export function ShinhanGuestFormButton(props: GuestFormButtonProps) {
  const { available, startIntake } = useStartGuestIntake();
  return <BtnCta {...props} disabled={!available} onClick={() => startIntake()} />;
}

interface GuestRegionButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onClick" | "disabled"
> {
  region: string;
  onValidInput?: () => void;
}

export function ShinhanGuestRegionButton({
  region,
  onValidInput,
  ...props
}: GuestRegionButtonProps) {
  const { available, startIntake } = useStartGuestIntake();
  return (
    <button
      {...props}
      type="button"
      disabled={!available}
      onClick={() => {
        if (available && shinhanGuestRegionSchema.safeParse(region).success) onValidInput?.();
        startIntake(region);
      }}
    />
  );
}

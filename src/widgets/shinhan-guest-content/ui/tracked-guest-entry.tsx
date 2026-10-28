"use client";

import type { ComponentProps } from "react";

import { useBetaFlowInput } from "@/features/beta-tracking";
import { ShinhanGuestRegionButton } from "@/features/shinhan-intake";

export function TrackedGuestRegionButton(
  props: Omit<ComponentProps<typeof ShinhanGuestRegionButton>, "onValidInput">,
) {
  const { trackValidInput } = useBetaFlowInput("GUEST_BUDGET", { entryOnMount: false });
  return <ShinhanGuestRegionButton {...props} onValidInput={trackValidInput} />;
}

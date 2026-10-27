"use client";

import type { ComponentProps } from "react";

import { useBetaFlowInput } from "@/features/beta-tracking";
import { ShinhanGuestDemandSearch, ShinhanGuestRegionButton } from "@/features/shinhan-intake";

export function TrackedGuestDemandSearch(
  props: Omit<ComponentProps<typeof ShinhanGuestDemandSearch>, "onValidInput">,
) {
  const { trackValidInput } = useBetaFlowInput("GUEST_DEMAND", { entryOnMount: false });
  return <ShinhanGuestDemandSearch {...props} onValidInput={trackValidInput} />;
}

export function TrackedGuestRegionButton(
  props: Omit<ComponentProps<typeof ShinhanGuestRegionButton>, "onValidInput">,
) {
  const { trackValidInput } = useBetaFlowInput("GUEST_DEMAND", { entryOnMount: false });
  return <ShinhanGuestRegionButton {...props} onValidInput={trackValidInput} />;
}

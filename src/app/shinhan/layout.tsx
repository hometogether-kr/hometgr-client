import type { ReactNode } from "react";

import { BetaTrackingProvider } from "@/features/beta-tracking";
import { getBetaTrackingContext } from "@/features/beta-tracking/server";

export default function ShinhanLayout({ children }: { children: ReactNode }) {
  return <BetaTrackingProvider context={getBetaTrackingContext()}>{children}</BetaTrackingProvider>;
}

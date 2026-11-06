import { connection } from "next/server";
import type { ReactNode } from "react";

import { BetaTrackingProvider } from "@/features/beta-tracking";
import { getBetaTrackingContext } from "@/features/beta-tracking/server";

export default async function ShinhanLayout({ children }: { children: ReactNode }) {
  await connection();
  return <BetaTrackingProvider context={getBetaTrackingContext()}>{children}</BetaTrackingProvider>;
}

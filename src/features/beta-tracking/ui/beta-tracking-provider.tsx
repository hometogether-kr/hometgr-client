"use client";

import { usePathname } from "next/navigation";
import { createContext, type ReactNode, useEffect, useMemo } from "react";

import { type BetaTrackingContext, betaTrackingContextSchema } from "@/domains/beta-tracking";

import { cleanupBrowserTrackingStates } from "../model/browser-state";
import {
  type BetaBrowserTracker,
  createBetaBrowserTracker,
  isTrackingPath,
} from "../model/browser-tracker";

export const BetaTrackerContext = createContext<BetaBrowserTracker | null>(null);

interface BetaTrackingProviderProps {
  context: BetaTrackingContext | null;
  children: ReactNode;
}

export function BetaTrackingProvider({ context, children }: BetaTrackingProviderProps) {
  const pathname = usePathname();
  const contextId = context?.context_id;
  const completionBasis = context?.completion_basis;
  const tracker = useMemo(() => {
    const parsed = betaTrackingContextSchema.safeParse({
      context_id: contextId,
      completion_basis: completionBasis,
    });
    return parsed.success ? createBetaBrowserTracker(parsed.data) : null;
  }, [contextId, completionBasis]);
  const allowed = isTrackingPath(pathname);

  useEffect(() => {
    if (!allowed || !tracker) return;
    void tracker.start();
    return () => tracker.stop();
  }, [allowed, tracker]);

  useEffect(() => {
    if (tracker && allowed) return;
    let stopped = false;
    let timer: number | undefined;
    const cleanup = async () => {
      window.clearTimeout(timer);
      const expiry = await cleanupBrowserTrackingStates();
      if (!stopped && expiry !== null) {
        timer = window.setTimeout(
          () => {
            void cleanup().catch(() => {});
          },
          Math.min(Math.max(expiry - Date.now(), 1), 2_147_483_647),
        );
      }
    };
    void cleanup().catch(() => {});
    return () => {
      stopped = true;
      window.clearTimeout(timer);
    };
  }, [allowed, tracker]);

  return <BetaTrackerContext value={allowed ? tracker : null}>{children}</BetaTrackerContext>;
}

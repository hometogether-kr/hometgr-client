"use client";

import { useCallback, useContext, useEffect, useMemo } from "react";

import type { BetaFlowId } from "@/domains/beta-tracking";

import { BetaTrackerContext } from "../ui/beta-tracking-provider";

interface BetaFlowInputOptions {
  enabled?: boolean;
  entryOnMount?: boolean;
}

export function useBetaFlowInput(flow: BetaFlowId, options: BetaFlowInputOptions = {}) {
  const tracker = useContext(BetaTrackerContext);
  const enabled = options.enabled ?? true;
  const entryOnMount = options.entryOnMount ?? true;
  // This pure object is also captured by an already-running submit callback.
  const binding = useMemo(
    () => (tracker && enabled ? tracker.createFormBinding(flow, { entryOnMount }) : null),
    [tracker, enabled, flow, entryOnMount],
  );

  useEffect(() => {
    if (!binding || !tracker) return;
    const prepare = () => {
      tracker.prepareFormBinding(binding);
    };
    prepare();
    document.addEventListener("visibilitychange", prepare);
    return () => document.removeEventListener("visibilitychange", prepare);
  }, [tracker, binding]);

  const trackValidInput = useCallback(() => {
    if (binding) tracker?.trackValidInput(binding);
  }, [tracker, binding]);
  const markResultReady = useCallback(() => {
    if (binding) tracker?.markResultReady(binding);
  }, [tracker, binding]);

  return { trackValidInput, markResultReady };
}

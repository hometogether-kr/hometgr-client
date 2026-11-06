"use client";

import { useContext, useEffect, useRef } from "react";

import type { BetaFlowId } from "@/domains/beta-tracking";

import type { BetaBrowserTracker, ResultObservationBinding } from "../model/browser-tracker";
import { BetaTrackerContext } from "./beta-tracking-provider";

interface BetaFlowObserverProps {
  flow: BetaFlowId;
  resultVisible?: boolean;
  guideVisible?: boolean;
}
interface CapturedResult {
  tracker: BetaBrowserTracker;
  flow: BetaFlowId;
  binding: ResultObservationBinding | null;
}

export function BetaFlowObserver({
  flow,
  resultVisible = false,
  guideVisible = false,
}: BetaFlowObserverProps) {
  const tracker = useContext(BetaTrackerContext);
  const marker = useRef<HTMLSpanElement>(null);
  const captured = useRef<CapturedResult | null>(null);

  useEffect(() => {
    const element = marker.current;
    if (!tracker || !element || (!resultVisible && !guideVisible)) return;
    if (
      !captured.current ||
      captured.current.tracker !== tracker ||
      captured.current.flow !== flow
    ) {
      captured.current = { tracker, flow, binding: tracker.captureResultBinding(flow) };
    }
    const binding = captured.current.binding;
    let intersecting = false;
    const observe = () => {
      if (!intersecting || document.visibilityState !== "visible") return;
      if (resultVisible) tracker.observeResult(binding, "result");
      if (guideVisible) tracker.observeResult(binding, "guide");
    };
    if (typeof IntersectionObserver !== "function") return;
    const observer = new IntersectionObserver(([entry]) => {
      intersecting = entry?.isIntersecting === true;
      observe();
    });
    observer.observe(element);
    document.addEventListener("visibilitychange", observe);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", observe);
    };
  }, [tracker, flow, resultVisible, guideVisible]);

  return (
    <span
      ref={marker}
      aria-hidden="true"
      data-beta-observer={flow}
      style={{ position: "absolute", width: 1, height: 1, pointerEvents: "none" }}
    />
  );
}

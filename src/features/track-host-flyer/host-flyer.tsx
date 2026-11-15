"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

import { HOST_FLYER_PATH } from "@/domains/marketing-attribution/host-flyer";
import {
  clearHostFlyerOnOtherCampaign,
  flushHostFlyerLeads,
  getHostFlyerConsent,
  getHostFlyerSession,
  getServerFlyerConsent,
  pauseHostFlyerTag,
  resetHostFlyerLanding,
  setHostFlyerConsent,
  subscribeHostFlyer,
  syncHostFlyerDocument,
  watchHostFlyerForms,
  watchHostFlyerLanding,
} from "@/domains/marketing-attribution/host-flyer-browser";

export function HostFlyerObserver() {
  const pathname = usePathname();
  const search = useSearchParams().toString();

  useEffect(() => {
    syncHostFlyerDocument();
    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) syncHostFlyerDocument(true);
    }
    window.addEventListener("pageshow", handlePageShow);
    const stopWatchingForms = watchHostFlyerForms();
    document.addEventListener("visibilitychange", flushHostFlyerLeads);
    return () => {
      document.removeEventListener("visibilitychange", flushHostFlyerLeads);
      window.removeEventListener("pageshow", handlePageShow);
      stopWatchingForms();
    };
  }, []);

  useEffect(() => {
    clearHostFlyerOnOtherCampaign(search);
    if (pathname !== HOST_FLYER_PATH) resetHostFlyerLanding();
    let stopWatching: (() => void) | undefined;

    function refreshWatch() {
      stopWatching?.();
      stopWatching = undefined;
      if (!getHostFlyerSession()) {
        pauseHostFlyerTag();
        return;
      }
      if (pathname === HOST_FLYER_PATH) stopWatching = watchHostFlyerLanding();
    }

    refreshWatch();
    const unsubscribe = subscribeHostFlyer(refreshWatch);
    return () => {
      unsubscribe();
      stopWatching?.();
    };
  }, [pathname, search]);

  return null;
}

export function HostFlyerConsent() {
  const choice = useSyncExternalStore(
    subscribeHostFlyer,
    getHostFlyerConsent,
    getServerFlyerConsent,
  );
  if (choice === "unavailable") return null;

  return (
    <aside
      className="border-b border-grayscale-200 bg-white px-4 py-2 text-sm text-grayscale-700"
      aria-label="방문 통계 설정"
    >
      <div className="mx-auto flex max-w-[1152px] flex-wrap items-center justify-between gap-x-4 gap-y-1">
        {choice === "ask" ? (
          <>
            <p className="max-w-prose">
              광고지에서 방문한 경로와 이용 통계를 Google Analytics로 측정해도 될까요? 선택은 상담과
              방 등록에 영향을 주지 않습니다.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="min-h-11 rounded-lg px-3 underline"
                onClick={() => setHostFlyerConsent("declined")}
              >
                건너뛰기
              </button>
              <button
                type="button"
                className="min-h-11 rounded-lg bg-grayscale-900 px-3 text-white"
                onClick={() => setHostFlyerConsent("approved")}
              >
                통계 수집 허용
              </button>
            </div>
          </>
        ) : (
          <>
            <p>
              {choice === "approved"
                ? "광고지 방문 통계를 수집하고 있습니다."
                : "광고지 방문 통계 수집을 건너뛰었습니다."}
            </p>
            <button
              type="button"
              className="min-h-11 rounded-lg px-3 underline"
              onClick={() => setHostFlyerConsent(choice === "approved" ? "declined" : "approved")}
            >
              {choice === "approved" ? "통계 수집 중지" : "통계 수집 허용"}
            </button>
          </>
        )}
      </div>
    </aside>
  );
}

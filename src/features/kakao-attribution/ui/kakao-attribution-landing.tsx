"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { MarketingSource } from "@/domains/marketing-attribution";

import { openKakaoChannelChat } from "../model/kakao-channel";
import { trackAttributionEvent, type TrackingContext } from "../model/tracking";

interface KakaoAttributionLandingProps {
  campaign?: string;
  source: MarketingSource;
}

function getLandingViewDeduplicationKey({ campaign, source }: TrackingContext) {
  return `hometogether:marketing:landing-view:${source}:${campaign ?? "-"}`;
}

export function KakaoAttributionLanding({ campaign, source }: KakaoAttributionLandingProps) {
  const context = useMemo(() => ({ campaign, source }), [campaign, source]);
  const clickLocked = useRef(false);
  const landingTracked = useRef(false);
  const [chatError, setChatError] = useState<string>();
  const [isOpening, setIsOpening] = useState(false);
  useEffect(() => {
    if (landingTracked.current) return;
    landingTracked.current = true;

    const key = getLandingViewDeduplicationKey(context);
    try {
      if (sessionStorage.getItem(key)) return;
      // Mark first so React Strict Mode cannot send a duplicated page view.
      sessionStorage.setItem(key, "sent");
    } catch {
      // Storage can be unavailable in private browsing; tracking still proceeds.
    }

    void trackAttributionEvent(context, "landing_view").catch(() => {
      console.warn("[marketing-attribution] landing_view was not recorded.");
    });
  }, [context]);

  async function handleChatClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (clickLocked.current) return;

    clickLocked.current = true;
    setChatError(undefined);
    setIsOpening(true);

    try {
      // Record the button interaction before opening Kakao. The catch is
      // intentional: an attribution outage must never block a consultation.
      await trackAttributionEvent(context, "kakao_chat_click");
    } catch {
      console.warn("[marketing-attribution] kakao_chat_click was not recorded.");
    }

    try {
      await openKakaoChannelChat();
    } catch {
      setChatError("카카오 채널 연결 정보를 확인해주세요.");
    } finally {
      setIsOpening(false);
      window.setTimeout(() => {
        clickLocked.current = false;
      }, 1_000);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-grayscale-50 px-4 py-6">
      <section
        aria-labelledby="kakao-attribution-title"
        className="w-full max-w-[430px] rounded-3xl border border-grayscale-200 bg-white px-8 py-12 text-center shadow-[0_18px_55px_rgb(31_42_55_/_9%)]"
      >
        <p className="text-label-2 font-bold tracking-[0.13em] text-primary-500">HOME TOGETHER</p>
        <h1 id="kakao-attribution-title" className="mt-5 text-title-2 font-bold text-grayscale-900">
          홈투게더에 문의하기
        </h1>
        <p className="mt-3 text-body-1 text-grayscale-600">카카오톡으로 빠르게 상담해드릴게요.</p>
        <button
          aria-busy={isOpening}
          className="mt-8 block w-full rounded-xl bg-system-kakao px-6 py-4 text-body-1 font-bold text-grayscale-900 transition-opacity hover:opacity-80 focus-visible:ring-3 focus-visible:ring-grayscale-900 focus-visible:ring-offset-3 focus-visible:outline-none disabled:cursor-wait disabled:opacity-80"
          disabled={isOpening}
          onClick={(event) => {
            void handleChatClick(event);
          }}
          type="button"
        >
          {isOpening ? "카카오톡 연결 중…" : "카카오톡 문의하기"}
        </button>
        {chatError ? (
          <p className="mt-4 text-label-1 text-system-error" role="alert">
            {chatError}
          </p>
        ) : null}
      </section>
    </main>
  );
}

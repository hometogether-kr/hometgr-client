"use client";

import { useEffect, useRef, useState } from "react";
import { z } from "zod";

import { geocodeAddress, loadKakaoMaps } from "@/shared/lib/kakao-map";
import { BtnCta } from "@/shared/ui/btn-cta";

interface KakaoMapPresentationProps {
  javaScriptKey: string;
  label: string;
}

type KakaoMapProps = KakaoMapPresentationProps &
  (
    | { address: string; latitude?: never; longitude?: never }
    | { address?: never; latitude: number; longitude: number }
  );

const coordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

function KakaoMapCanvas({
  address,
  latitude,
  longitude,
  javaScriptKey,
  label,
  onRetry,
}: KakaoMapProps & { onRetry: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let disposed = false;
    const controller = new AbortController();
    let release = () => {};
    async function initialize() {
      try {
        const maps = await loadKakaoMaps(javaScriptKey);
        if (disposed || !container) return;
        const coordinates =
          address !== undefined
            ? await geocodeAddress({ address, maps, signal: controller.signal })
            : coordinatesSchema.parse({ latitude, longitude });
        if (disposed) return;
        const center = new maps.LatLng(coordinates.latitude, coordinates.longitude);
        const map = new maps.Map(container, { center, level: 3, keyboardShortcuts: true });
        const marker = new maps.Marker({ map, position: center });
        const observer = new ResizeObserver(() => {
          map.relayout();
          map.setCenter(center);
        });
        observer.observe(container);
        release = () => {
          observer.disconnect();
          marker.setMap(null);
          container.replaceChildren();
        };
        setStatus("ready");
      } catch {
        if (!disposed) setStatus("error");
      }
    }
    void initialize();
    return () => {
      disposed = true;
      controller.abort();
      release();
    };
  }, [address, latitude, longitude, javaScriptKey]);

  return (
    <div className="relative h-[320px] w-full overflow-hidden rounded-xl bg-grayscale-70 md:h-[440px]">
      <div
        ref={containerRef}
        role="region"
        aria-label={label}
        aria-busy={status === "loading"}
        tabIndex={0}
        className="size-full"
      />
      {status !== "ready" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-grayscale-70 px-5 text-center text-grayscale-600">
          {status === "loading" ? (
            <p role="status">지도를 불러오는 중이에요.</p>
          ) : (
            <>
              <p role="alert">지도를 불러오지 못했어요. 잠시 후 다시 시도해주세요.</p>
              <BtnCta size="s" onClick={onRetry}>
                지도 다시 시도
              </BtnCta>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function KakaoMap(props: KakaoMapProps) {
  const [attempt, setAttempt] = useState(0);
  return (
    <KakaoMapCanvas
      key={`${props.address ?? `${props.latitude}:${props.longitude}`}:${props.javaScriptKey}:${attempt}`}
      {...props}
      onRetry={() => setAttempt((value) => value + 1)}
    />
  );
}

import { z } from "zod";

interface KakaoLatLng {
  getLat(): number;
  getLng(): number;
}

interface KakaoMapInstance {
  relayout(): void;
  setCenter(position: KakaoLatLng): void;
}

interface KakaoMarkerInstance {
  setMap(map: KakaoMapInstance | null): void;
}

interface KakaoMapsSdk {
  LatLng: new (latitude: number, longitude: number) => KakaoLatLng;
  Map: new (
    container: HTMLElement,
    options: { center: KakaoLatLng; level: number; keyboardShortcuts: boolean },
  ) => KakaoMapInstance;
  Marker: new (options: { map: KakaoMapInstance; position: KakaoLatLng }) => KakaoMarkerInstance;
}

const isFunction = (value: unknown) => typeof value === "function";
const mapsLoaderSchema = z.object({
  load: z.custom<(callback: () => void) => void>(isFunction),
});
const mapsSdkSchema = z.object({
  LatLng: z.custom<KakaoMapsSdk["LatLng"]>(isFunction),
  Map: z.custom<KakaoMapsSdk["Map"]>(isFunction),
  Marker: z.custom<KakaoMapsSdk["Marker"]>(isFunction),
});

let sdkPromise: Promise<KakaoMapsSdk> | undefined;

function readMaps(): unknown {
  const kakao: unknown = Reflect.get(window, "kakao");
  return typeof kakao === "object" && kakao !== null ? Reflect.get(kakao, "maps") : undefined;
}

/** 지도 표시 SDK만 요청한다. 주소 검색·좌표 변환용 services 라이브러리는 로드하지 않는다. */
export function loadKakaoMaps(javaScriptKey: string): Promise<KakaoMapsSdk> {
  if (sdkPromise) return sdkPromise;
  const request = new Promise<KakaoMapsSdk>((resolve, reject) => {
    const script = document.createElement("script");
    let settled = false;
    const finish = (sdk?: KakaoMapsSdk) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      script.onload = null;
      script.onerror = null;
      if (sdk) resolve(sdk);
      else {
        script.remove();
        reject(new Error("카카오맵 SDK를 불러오지 못했습니다."));
      }
    };
    const timeout = window.setTimeout(() => finish(), 15000);
    const initialize = () => {
      const maps = readMaps();
      const loader = mapsLoaderSchema.safeParse(maps);
      if (!loader.success) {
        finish();
        return;
      }
      try {
        loader.data.load.call(maps, () => {
          const parsed = mapsSdkSchema.safeParse(readMaps());
          finish(parsed.success ? parsed.data : undefined);
        });
      } catch {
        finish();
      }
    };
    if (mapsLoaderSchema.safeParse(readMaps()).success) {
      initialize();
      return;
    }
    script.async = true;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?${new URLSearchParams({ appkey: javaScriptKey, autoload: "false" }).toString()}`;
    script.onload = initialize;
    script.onerror = () => finish();
    document.head.appendChild(script);
  });
  sdkPromise = request.catch((error: unknown) => {
    sdkPromise = undefined;
    throw error;
  });
  return sdkPromise;
}

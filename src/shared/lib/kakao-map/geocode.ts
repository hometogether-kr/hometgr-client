import { z } from "zod";

import { loadKakaoMaps } from "./sdk";

const addressResultSchema = z
  .array(
    z.object({
      x: z.string().trim().min(1).transform(Number).pipe(z.number().min(-180).max(180)),
      y: z.string().trim().min(1).transform(Number).pipe(z.number().min(-90).max(90)),
    }),
  )
  .length(1);

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface GeocodeAddressInput {
  address: string;
  maps: Awaited<ReturnType<typeof loadKakaoMaps>>;
  signal: AbortSignal;
}

/** 검색 결과가 없거나 여러 건이면 임의의 위치를 선택하지 않습니다. */
export function geocodeAddress({
  address,
  maps,
  signal,
}: GeocodeAddressInput): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new Error("주소 검색이 취소되었습니다."));
      return;
    }
    let settled = false;
    const finish = (coordinates?: Coordinates) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      signal.removeEventListener("abort", abort);
      if (coordinates) resolve(coordinates);
      else reject(new Error("주소의 위치를 확인하지 못했습니다."));
    };
    const abort = () => finish();
    const timeout = setTimeout(() => finish(), 15000);
    signal.addEventListener("abort", abort, { once: true });
    try {
      new maps.services.Geocoder().addressSearch(address, (result, status) => {
        if (settled) return;
        const parsed = addressResultSchema.safeParse(result);
        if (status !== maps.services.Status.OK || !parsed.success) {
          finish();
          return;
        }
        finish({ latitude: parsed.data[0].y, longitude: parsed.data[0].x });
      });
    } catch {
      finish();
    }
  });
}

export interface ReservationLocationCardProps {
  /**
   * - "locked": 방문 확정 전 — 주소를 가리고 안내 문구만 (Figma 5.1.1)
   * - "address": 방문 확정 후 — 상세 주소 공개 (Figma 5.1.2)
   */
  variant: "locked" | "address";
  address: string;
}

/**
 * 위치 카드 (Figma 5.1.1~5.1.2 "위치")
 *
 * 지도 블록은 좌표 API 연동 전까지 Figma의 회색 플레이스홀더를 그대로 둡니다.
 */
export function ReservationLocationCard({ variant, address }: ReservationLocationCardProps) {
  return (
    <section className="flex flex-col gap-5 rounded-[20px] border-[1.4px] border-grayscale-200 bg-white px-9 py-8">
      {variant === "address" ? (
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-title-3 font-semibold text-grayscale-900">위치</h2>
          <p className="text-headline-1 font-medium text-grayscale-600">{address}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <h2 className="text-title-3 font-semibold text-grayscale-900">위치</h2>
          <p className="text-body-2 font-medium text-grayscale-600">
            정확한 주소는 방문 확정 시 제공됩니다.
          </p>
        </div>
      )}
      <div className="flex h-[280px] w-full items-center justify-center rounded-xl bg-[#9f9f9f] md:h-[441px]">
        <span className="border border-solid border-[#cfc4c5] bg-white px-[9px] py-[5px] text-[14px] font-bold tracking-[0.28px] text-[#5e5e5e]">
          Map Data: Seoul
        </span>
      </div>
    </section>
  );
}

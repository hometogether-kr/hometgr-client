import { formatManwon, type RoomPrice } from "@/domains/listing";
import { BtnCta } from "@/shared/ui/btn-cta";

export interface PriceSidebarGuestProps {
  price: RoomPrice;
  onRequireLogin: () => void;
}

/**
 * 가격/예약 사이드바 — 비회원 (Figma: node 1217:9609)
 */
export function PriceSidebarGuest({ price, onRequireLogin }: PriceSidebarGuestProps) {
  return (
    <aside className="flex w-full flex-col gap-10 rounded-2xl border border-grayscale-200 bg-white p-7 md:w-[380px] md:shrink-0 md:p-9">
      <div className="flex flex-col gap-3">
        <p className="text-headline-1 font-medium text-grayscale-500">보증금 / 월세</p>
        <p className="text-title-2 font-semibold text-grayscale-800">
          {formatManwon(price.depositKrw)} / {formatManwon(price.monthlyRentKrw)}
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <BtnCta size="l" className="w-full" onClick={onRequireLogin}>
          로그인 후 예약 가능
        </BtnCta>
        <p className="text-center text-body-2 font-medium text-grayscale-500">
          방문 예약을 위해 로그인이 필요합니다.
        </p>
      </div>
    </aside>
  );
}

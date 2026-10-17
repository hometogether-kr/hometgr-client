import { formatMonthlyRent, formatPriceKrw, type RoomPrice } from "@/domains/listing";
import { BtnCta } from "@/shared/ui/btn-cta";

import { KakaoInquiryLink } from "./kakao-inquiry-link";

export interface PriceSidebarGuestProps {
  price: RoomPrice;
}

/**
 * 가격/문의 사이드바 — 비회원. 로그인 없이 카카오 문의가 가능합니다.
 */
export function PriceSidebarGuest({ price }: PriceSidebarGuestProps) {
  return (
    <aside className="flex w-full flex-col gap-10 rounded-2xl border border-grayscale-200 bg-white p-7 md:w-[380px] md:shrink-0 md:p-9">
      <div className="flex flex-col gap-3">
        <p className="text-headline-1 font-medium text-grayscale-500">보증금 / 월세</p>
        <p className="text-title-2 font-semibold text-grayscale-800">
          {formatPriceKrw(price.depositKrw)} / {formatMonthlyRent(price.monthlyRentKrw)}
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <KakaoInquiryLink />
        <BtnCta size="l" className="w-full" disabled title="현재 카카오 채널로 문의해 주세요.">
          방문 예약 신청
        </BtnCta>
        <p className="text-center text-body-2 font-medium text-grayscale-500">
          로그인 없이 카카오 채널로 문의할 수 있어요.
        </p>
      </div>
    </aside>
  );
}

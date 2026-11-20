import Link from "next/link";

import { formatMonthlyRent, formatPriceKrw, type RoomPrice } from "@/domains/listing";
import { BtnCta } from "@/shared/ui/btn-cta";

import { KakaoInquiryLink } from "./kakao-inquiry-link";

export interface PriceSidebarMemberProps {
  price: RoomPrice;
  canRequestVisit: boolean;
  visitRequestHref?: string;
}

export function PriceSidebarMember({
  price,
  canRequestVisit,
  visitRequestHref,
}: PriceSidebarMemberProps) {
  return (
    <aside className="flex w-full flex-col gap-10 rounded-2xl border border-grayscale-200 bg-white p-7 md:w-[380px] md:shrink-0 md:p-9">
      <div className="flex flex-col gap-3">
        <p className="text-headline-1 font-medium text-grayscale-500">보증금 / 월세</p>
        <p className="text-title-2 font-semibold text-grayscale-800">
          {formatPriceKrw(price.depositKrw)} / {formatMonthlyRent(price.monthlyRentKrw)}
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <p className="text-center text-body-2 font-medium text-grayscale-500">
          {visitRequestHref
            ? "계약은 카카오 채널로 문의해 주세요."
            : "방문 및 계약은 카카오 채널로 문의해 주세요."}
        </p>
        <KakaoInquiryLink />
        <BtnCta size="l" className="w-full" disabled title="현재 카카오 채널로 문의해 주세요.">
          바로 계약하기
        </BtnCta>
        {visitRequestHref ? (
          <Link
            href={visitRequestHref}
            className="inline-flex h-[52px] w-full items-center justify-center rounded-xl bg-primary-100 px-6 text-body-1 font-semibold text-primary-500 hover:opacity-80"
          >
            방문 예약 신청
          </Link>
        ) : (
          <BtnCta
            variant="sub"
            size="l"
            className="w-full"
            disabled
            title="현재 카카오 채널로 문의해 주세요."
          >
            {canRequestVisit ? "방문 예약 신청" : "예약 내역 보기"}
          </BtnCta>
        )}
      </div>
    </aside>
  );
}

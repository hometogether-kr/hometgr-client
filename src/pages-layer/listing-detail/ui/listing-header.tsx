import type { RoomDetail } from "@/domains/listing";
import { BtnText } from "@/shared/ui/btn-text";

const IC_HEART = "/figma/ic-heart-68d12736.svg";
const IC_SHARE = "/figma/ic-share-eff9bd60.svg";

/* eslint-disable @next/next/no-img-element -- next/image는 dangerouslyAllowSVG 없이 SVG를 막습니다 */

export interface ListingHeaderProps {
  room: RoomDetail;
}

/**
 * 매물 제목/주소/저장·공유 (Figma: node 1222:29434)
 */
export function ListingHeader({ room }: ListingHeaderProps) {
  return (
    <div className="flex w-full items-start justify-between gap-4">
      <div className="flex flex-1 flex-col gap-3 md:gap-4">
        <h1 className="text-[28px] leading-[1.3] font-semibold tracking-[-0.02em] text-grayscale-900 md:text-[40px]">
          {room.title}
        </h1>
        <div className="flex flex-wrap gap-3 text-headline-1 font-medium">
          <span className="text-grayscale-600">{room.addressRegion ?? room.locationSummary}</span>
          <span className="text-primary-400">{room.addressDisclosureNote}</span>
        </div>
      </div>
      <div className="hidden shrink-0 items-start gap-4 px-1 md:flex">
        <BtnText size="16" rightIcon={<img alt="" src={IC_HEART} />}>
          저장하기
        </BtnText>
        <BtnText size="16" rightIcon={<img alt="" src={IC_SHARE} />}>
          공유하기
        </BtnText>
      </div>
    </div>
  );
}

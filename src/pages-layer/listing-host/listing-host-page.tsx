import Link from "next/link";

import type { RoomDetail } from "@/domains/listing";
import { ROUTES } from "@/shared/config";
import { SiteLayout } from "@/widgets/site-layout";

import { HostProfileCard } from "./ui/host-profile-card";
import { HouseholdCard } from "./ui/household-card";
import { RoomSummaryCard } from "./ui/room-summary-card";
import { VerificationCard } from "./ui/verification-card";

/** Navigation의 드롭다운 화살표를 뒤집어 재사용합니다. */
const IC_ARROW = "/figma/ic-arrow-down-2f96af07.svg";

export interface ListingHostPageProps {
  room: RoomDetail;
}

/**
 * 집주인 정보 (Figma: node 1222:51123)
 *
 * 매물 상세의 "집주인 정보" 카드에서 진입합니다. 상단 "상세정보로 가기"로
 * 다시 매물 상세로 돌아갈 수 있습니다.
 */
export function ListingHostPage({ room }: ListingHostPageProps) {
  return (
    <SiteLayout background="white">
      <div className="flex w-full flex-col gap-10 px-4 py-8 md:gap-12 md:px-[200px] md:py-[100px]">
        <div className="flex flex-col gap-7">
          <Link
            href={ROUTES.roomDetail(room.id)}
            className="inline-flex w-fit items-center gap-3 rounded-xl border border-grayscale-300 px-6 py-4 text-body-1 font-semibold text-grayscale-600 transition-opacity hover:opacity-80"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- next/image는 dangerouslyAllowSVG 없이 SVG를 막습니다 */}
            <img alt="" src={IC_ARROW} className="block max-w-none rotate-90" />
            상세정보로 가기
          </Link>
          <h1 className="text-[28px] leading-[1.3] font-semibold tracking-[-0.02em] text-grayscale-900 md:text-[40px]">
            집주인 정보
          </h1>
        </div>

        <div className="flex w-full flex-col gap-8 md:flex-row md:items-start md:gap-10">
          <div className="flex w-full flex-col gap-7 md:flex-1">
            <HostProfileCard host={room.host} />
            <HouseholdCard household={room.household} />
            <RoomSummaryCard room={room} />
          </div>
          <VerificationCard />
        </div>
      </div>
    </SiteLayout>
  );
}

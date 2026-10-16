import type { RoomDetail } from "@/domains/listing";
import { ROUTES } from "@/shared/config";
import { BackLink } from "@/shared/ui/back-link";
import { SiteLayout } from "@/widgets/site-layout";

import { HostProfileCard } from "./ui/host-profile-card";
import { HouseholdCard } from "./ui/household-card";
import { RoomSummaryCard } from "./ui/room-summary-card";
import { VerificationCard } from "./ui/verification-card";

export interface ListingHostPageProps {
  room: RoomDetail;
  returnHref: string;
}

/**
 * 집주인 정보 (Figma: node 1222:51123)
 *
 * 매물 상세의 "집주인 정보" 카드에서 진입합니다. 상단 "상세정보로 가기"로
 * 다시 매물 상세로 돌아갈 수 있습니다.
 */
export function ListingHostPage({ room, returnHref }: ListingHostPageProps) {
  const detailHref = `${ROUTES.roomDetail(room.id)}?${new URLSearchParams({ returnTo: returnHref })}`;

  return (
    <SiteLayout background="white">
      <div className="flex w-full flex-col gap-10 px-4 py-8 md:gap-12 md:px-[200px] md:py-[100px]">
        <div className="flex flex-col gap-7">
          <BackLink href={detailHref} variant="stroke">
            상세 정보로 가기
          </BackLink>
          <h1 className="text-[28px] leading-[1.3] font-semibold tracking-[-0.02em] text-grayscale-900 md:text-[40px]">
            집주인 정보
          </h1>
        </div>

        <div className="flex w-full flex-col gap-8 md:flex-row md:items-start md:gap-10">
          <div className="flex w-full flex-col gap-7 md:flex-1">
            <HostProfileCard host={room.host} />
            {room.household && <HouseholdCard household={room.household} />}
            <RoomSummaryCard room={room} detailHref={detailHref} />
          </div>
          <VerificationCard />
        </div>
      </div>
    </SiteLayout>
  );
}

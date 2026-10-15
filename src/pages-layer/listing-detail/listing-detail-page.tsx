"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  GUEST_LOCATION_DISCLOSURE,
  MEMBER_LOCATION_DISCLOSURE,
  type RoomDetail,
} from "@/domains/listing";
import { useSession } from "@/domains/user";
import { LoginPromptModal } from "@/features/prompt-login";
import { SiteLayout } from "@/widgets/site-layout";

import { ContractCardGuest } from "./ui/contract-card-guest";
import { ContractCardMember } from "./ui/contract-card-member";
import { DescriptionCard } from "./ui/description-card";
import { HostCard } from "./ui/host-card";
import { ListingHeader } from "./ui/listing-header";
import { LocationCardGuest } from "./ui/location-card-guest";
import { LocationCardMember } from "./ui/location-card-member";
import { OptionsCard } from "./ui/options-card";
import { PhotoGalleryGuest } from "./ui/photo-gallery-guest";
import { PhotoGalleryMember } from "./ui/photo-gallery-member";
import { PriceSidebarGuest } from "./ui/price-sidebar-guest";
import { PriceSidebarMember } from "./ui/price-sidebar-member";

export interface ListingDetailPageProps {
  room: RoomDetail;
  returnHref: string;
}

/**
 * 매물 상세 (Figma: 3.1 매물 상세 - 비회원 · 3.2 매물 상세 - 회원,
 * node 1067:44532 · 1222:45286)
 *
 * 비회원/회원에 따라 계약 조건·위치·사진 갤러리가 다르게 렌더링됩니다. 비회원이
 * 잠긴 정보를 열람하려 하면 로그인 모달을 띄웁니다.
 */
export function ListingDetailPage({ room, returnHref }: ListingDetailPageProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useSession();
  const canViewMemberDetail = isAuthenticated && room.viewerAccess === "member";
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const requireLogin = () => setLoginModalOpen(true);

  // 서버 렌더 중 갱신할 수 없던 토큰을 /me BFF가 복구하면 서버 상세도 다시 조회합니다.
  useEffect(() => {
    if (!isLoading && isAuthenticated && room.viewerAccess === "guest") router.refresh();
  }, [isLoading, isAuthenticated, room.viewerAccess, room.id, router]);

  return (
    <SiteLayout background="white">
      <div className="flex w-full flex-col gap-10 px-4 py-8 md:gap-12 md:px-[200px] md:py-[100px]">
        <nav aria-label="목록 복귀">
          <Link href={returnHref} scroll={false} prefetch={false} className="text-sm underline">
            검색 결과로 돌아가기
          </Link>
        </nav>
        {canViewMemberDetail ? (
          <PhotoGalleryMember photos={room.photos} />
        ) : (
          <PhotoGalleryGuest photos={room.photos} onRequireLogin={requireLogin} />
        )}

        <ListingHeader
          room={{
            ...room,
            addressDisclosureNote: canViewMemberDetail
              ? MEMBER_LOCATION_DISCLOSURE
              : GUEST_LOCATION_DISCLOSURE,
          }}
        />

        <div className="flex w-full flex-col gap-8 md:flex-row md:items-start md:gap-10">
          <div className="flex w-full min-w-0 flex-col gap-7 md:flex-1">
            {canViewMemberDetail ? (
              <>
                <ContractCardMember room={room} />
                <DescriptionCard
                  description={room.description}
                  currentResidentsDescription={room.currentResidentsDescription}
                  precautions={room.precautions}
                  moveInLabel={room.moveInLabel}
                  parkingLabel={room.parkingLabel}
                  petPolicyLabel={room.petPolicyLabel}
                />
                <OptionsCard amenities={room.amenities} />
                <LocationCardMember buildingAddress={room.buildingAddress} />
              </>
            ) : (
              <>
                <ContractCardGuest price={room.price} onRequireLogin={requireLogin} />
                <LocationCardGuest onRequireLogin={requireLogin} />
              </>
            )}
            <HostCard roomId={room.id} host={room.host} />
          </div>

          {canViewMemberDetail ? (
            <PriceSidebarMember price={room.price} canRequestVisit={room.canRequestVisit} />
          ) : (
            <PriceSidebarGuest price={room.price} />
          )}
        </div>
      </div>

      <LoginPromptModal open={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </SiteLayout>
  );
}

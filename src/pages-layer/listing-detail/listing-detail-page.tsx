"use client";

import { useState } from "react";

import type { RoomDetail } from "@/domains/listing";
import { useSession } from "@/domains/user";
import { LoginPromptModal } from "@/features/prompt-login";
import { VisitRequestModal } from "@/features/request-visit";
import { useToast } from "@/shared/ui/toast";
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
}

/**
 * 매물 상세 (Figma: 3.1 매물 상세 - 비회원 · 3.2 매물 상세 - 회원,
 * node 1067:44532 · 1222:45286)
 *
 * 비회원/회원에 따라 계약 조건·위치·사진 갤러리가 다르게 렌더링됩니다. 비회원이
 * 잠긴 정보를 열람하려 하면 로그인 모달을 띄웁니다.
 */
export function ListingDetailPage({ room }: ListingDetailPageProps) {
  const { isAuthenticated } = useSession();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const { showToast } = useToast();

  const requireLogin = () => setLoginModalOpen(true);

  return (
    <SiteLayout background="white">
      <div className="flex w-full flex-col gap-10 px-4 py-8 md:gap-12 md:px-[200px] md:py-[100px]">
        {isAuthenticated ? (
          <PhotoGalleryMember photos={room.photos} />
        ) : (
          <PhotoGalleryGuest photos={room.photos} onRequireLogin={requireLogin} />
        )}

        <ListingHeader room={room} />

        <div className="flex w-full flex-col gap-8 md:flex-row md:items-start md:gap-10">
          <div className="flex w-full flex-col gap-7 md:flex-1">
            {isAuthenticated ? (
              <>
                <ContractCardMember room={room} />
                <DescriptionCard
                  description={room.description}
                  moveInLabel={room.moveInLabel}
                  parkingLabel={room.parkingLabel}
                  petPolicyLabel={room.petPolicyLabel}
                />
                <OptionsCard amenities={room.amenities} />
                <LocationCardMember locationNote={room.locationNote} />
              </>
            ) : (
              <>
                <ContractCardGuest price={room.price} onRequireLogin={requireLogin} />
                <LocationCardGuest onRequireLogin={requireLogin} />
              </>
            )}
            <HostCard roomId={room.id} host={room.host} />
          </div>

          {isAuthenticated ? (
            <PriceSidebarMember price={room.price} onRequestVisit={() => setVisitModalOpen(true)} />
          ) : (
            <PriceSidebarGuest price={room.price} onRequireLogin={requireLogin} />
          )}
        </div>
      </div>

      <LoginPromptModal open={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
      <VisitRequestModal
        open={visitModalOpen}
        onClose={() => setVisitModalOpen(false)}
        onSubmit={() => {
          setVisitModalOpen(false);
          showToast("방문 예약을 신청했어요.", { variant: "success" });
        }}
      />
    </SiteLayout>
  );
}

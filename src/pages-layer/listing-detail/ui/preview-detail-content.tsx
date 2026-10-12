"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";

import type { MockRoomSource, MockRoomSourceOptions } from "@/features/preview-rooms";
import { previewRoomQueryKeys } from "@/features/preview-rooms";
import { getKakaoMapJavaScriptKey } from "@/shared/config";
import { KakaoMap } from "@/shared/ui/kakao-map";

import { ContractCardGuest } from "./contract-card-guest";
import { ContractCardMember } from "./contract-card-member";
import { DescriptionCard } from "./description-card";
import { DetailSection } from "./detail-section";
import { HostCard } from "./host-card";
import { ListingHeader } from "./listing-header";
import { LocationCardGuest } from "./location-card-guest";
import { OptionsCard } from "./options-card";
import { PhotoGalleryGuest } from "./photo-gallery-guest";
import { PhotoGalleryMember } from "./photo-gallery-member";
import { PriceSidebarGuest } from "./price-sidebar-guest";
import { PriceSidebarMember } from "./price-sidebar-member";

interface PreviewDetailContentProps {
  id: string;
  viewer: "guest" | "member";
  source: MockRoomSource;
  previewOptions: MockRoomSourceOptions;
}

export function PreviewDetailContent({
  id,
  viewer,
  source,
  previewOptions,
}: PreviewDetailContentProps) {
  const [notice, setNotice] = useState("");
  const {
    data: { room, location },
  } = useSuspenseQuery({
    queryKey: previewRoomQueryKeys.detail(previewOptions, id, viewer),
    queryFn: () => source.getRoomDetail(id, viewer),
    retry: false,
  });
  const explainLoginPreview = () =>
    setNotice(
      "실제 로그인은 실행하지 않습니다. 위의 회원 미리보기에서 공개 정보 차이를 확인할 수 있어요.",
    );
  const explainReservationPreview = () =>
    setNotice("미리보기에서는 예약·계약 기능을 실행하지 않습니다.");
  const mapKey = getKakaoMapJavaScriptKey();

  return (
    <>
      {viewer === "member" ? (
        <PhotoGalleryMember photos={room.photos} />
      ) : (
        <PhotoGalleryGuest photos={room.photos} onRequireLogin={explainLoginPreview} />
      )}
      <ListingHeader room={room} />
      <p role="status" className="min-h-6 text-sm text-grayscale-600">
        {notice || "가상 매물입니다. 실제 예약·계약은 진행되지 않습니다."}
      </p>
      <div className="flex w-full flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
        <div className="flex min-w-0 flex-1 flex-col gap-7">
          {viewer === "member" ? (
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
            </>
          ) : (
            <ContractCardGuest price={room.price} onRequireLogin={explainLoginPreview} />
          )}
          {location.access === "member" ? (
            <DetailSection title="위치">
              <p className="text-body-1 text-grayscale-500">
                동·호수 등 상세 위치는 방문 예약 후 확인할 수 있습니다.
              </p>
              <p className="text-body-1 break-words text-grayscale-800">
                {location.buildingAddress}
              </p>
              {mapKey ? (
                <KakaoMap
                  latitude={location.latitude}
                  longitude={location.longitude}
                  javaScriptKey={mapKey}
                  label="매물 건물 위치 지도 · 가상 좌표"
                />
              ) : (
                <div
                  role="status"
                  className="flex h-[440px] w-full items-center justify-center bg-grayscale-70 px-5 text-center text-grayscale-500"
                >
                  지도 연결 설정을 확인하고 있어요.
                </div>
              )}
              <p className="text-sm text-grayscale-500">{room.locationNote}</p>
            </DetailSection>
          ) : (
            <LocationCardGuest onRequireLogin={explainLoginPreview} />
          )}
          <HostCard roomId={room.id} host={room.host} href={null} />
        </div>
        {viewer === "member" ? (
          <PriceSidebarMember
            price={room.price}
            canRequestVisit={false}
            canRequestContract={false}
            isRequestingContract={false}
            onRequestContract={explainReservationPreview}
            onRequestVisit={explainReservationPreview}
            onViewReservation={explainReservationPreview}
          />
        ) : (
          <PriceSidebarGuest price={room.price} onRequireLogin={explainLoginPreview} />
        )}
      </div>
    </>
  );
}

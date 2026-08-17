"use client";

import { useRouter } from "next/navigation";

import type { RoomDetail } from "@/domains/listing";
import { ROUTES } from "@/shared/config";
import { BtnCta } from "@/shared/ui/btn-cta";
import { InfoBox } from "@/shared/ui/info-box";

export interface RoomSummaryCardProps {
  room: Pick<RoomDetail, "id" | "title" | "price" | "locationSummary" | "photos">;
}

/* eslint-disable @next/next/no-img-element -- 원본 매물 사진, next/image 최적화 대상 아님 */

/**
 * 매물 정보 요약 카드 (Figma: node 1222:54672)
 *
 * 집주인 페이지에서 보고 있던 매물로 돌아갈 수 있는 카드입니다.
 */
export function RoomSummaryCard({ room }: RoomSummaryCardProps) {
  const router = useRouter();
  const deposit = Math.round(room.price.depositKrw / 10_000);
  const rent = Math.round(room.price.monthlyRentKrw / 10_000);

  return (
    <section className="flex w-full flex-col gap-6 rounded-2xl border border-grayscale-200 px-6 py-7 md:px-9 md:py-8">
      <h2 className="text-title-3 font-semibold text-grayscale-900">매물 정보</h2>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="h-[125px] w-full shrink-0 overflow-hidden rounded-xl sm:w-[180px]">
          <img
            alt={room.title}
            src={room.photos[0]?.url}
            className="block size-full object-cover"
          />
        </div>
        <div className="flex flex-1 items-center justify-between gap-5">
          <div className="flex flex-col gap-1">
            <p className="text-heading-2 font-normal text-grayscale-700">{room.title}</p>
            <p className="text-title-3 font-semibold text-grayscale-900">
              월세 {deposit.toLocaleString("ko-KR")}/{rent.toLocaleString("ko-KR")}
            </p>
            <p className="text-body-1 font-normal text-grayscale-400">{room.locationSummary}</p>
          </div>
          <BtnCta variant="sub" size="s" onClick={() => router.push(ROUTES.roomDetail(room.id))}>
            매물 정보 보기
          </BtnCta>
        </div>
      </div>
      <InfoBox>
        상세 주소와 집주인 연락처는 방문 예약 또는 계약 과정에서 필요한 시점에 안전하게
        안내해드려요.
      </InfoBox>
    </section>
  );
}

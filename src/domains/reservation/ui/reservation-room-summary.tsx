import Link from "next/link";

import { ROUTES } from "@/shared/config";
import { BtnCta } from "@/shared/ui/btn-cta";

import type { ReservationDetailViewModel } from "../model/reservation-detail.types";
import { ReservationThumbnail } from "./reservation-thumbnail";

type RoomFields = Pick<
  ReservationDetailViewModel,
  "roomId" | "roomTitle" | "roomThumbnailUrl" | "roomLocationText" | "roomCategoryText" | "hostName"
>;

export interface ReservationRoomSummaryProps {
  reservation: RoomFields;
  /**
   * 부제 종류 — Figma상 대기/취소 화면은 위치 문구, 확정/후기 화면은 카테고리 문구를 씁니다.
   * @default "location"
   */
  subtitle?: "location" | "category";
  /** "매물 정보 보기" 링크 노출 (대기/취소 화면). @default false */
  withRoomLink?: boolean;
}

/**
 * 예약에 연결된 매물 요약 카드 (Figma 5.1.1~5.1.4 "매물 정보")
 */
export function ReservationRoomSummary({
  reservation,
  subtitle = "location",
  withRoomLink = false,
}: ReservationRoomSummaryProps) {
  const subtitleText =
    subtitle === "location" ? reservation.roomLocationText : reservation.roomCategoryText;

  return (
    <section className="flex flex-col gap-5 rounded-[20px] border-[1.4px] border-grayscale-200 bg-white px-9 py-8">
      <h2 className="text-title-3 font-semibold text-grayscale-900">매물 정보</h2>
      <div className="flex flex-col gap-5 sm:flex-row sm:gap-6">
        <div className="relative h-[125px] w-full shrink-0 overflow-hidden rounded-xl sm:w-[180px]">
          <ReservationThumbnail src={reservation.roomThumbnailUrl} alt={reservation.roomTitle} />
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-5 py-1">
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <div className="flex flex-col gap-1">
              <p
                className={
                  subtitle === "location"
                    ? "text-heading-2 font-normal text-grayscale-700"
                    : "text-body-1 font-normal text-grayscale-400"
                }
              >
                {subtitleText}
              </p>
              <p className="text-title-3 font-semibold text-grayscale-900">
                {reservation.roomTitle}
              </p>
            </div>
            <p className="text-body-1 font-normal text-grayscale-400">
              호스트: {reservation.hostName}
            </p>
          </div>
          {withRoomLink && (
            <Link href={ROUTES.roomDetail(reservation.roomId)} className="shrink-0">
              <BtnCta variant="sub" size="s">
                매물 정보 보기
              </BtnCta>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

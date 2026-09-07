"use client";

import Link from "next/link";

import {
  getReservationDetailPresentation,
  ReservationRoomSummary,
  useMyReservation,
} from "@/domains/reservation";
import { VisitReviewForm } from "@/features/write-visit-review";
import { ROUTES } from "@/shared/config";
import { BtnCta } from "@/shared/ui/btn-cta";
import { SiteLayout } from "@/widgets/site-layout";

import { ReservationDetailBackLink } from "./reservation-detail-back-link";

export interface VisitReviewPageProps {
  reservationId: string;
}

/**
 * 방문 후기 작성 (Figma 5.1.3)
 *
 * 방문 완료 상태의 예약에서만 진입합니다. 라우트에서 상태를 검증합니다.
 */
export function VisitReviewPage({ reservationId }: VisitReviewPageProps) {
  const { reservation, isLoading, error } = useMyReservation(reservationId);
  const canReview =
    reservation !== null && getReservationDetailPresentation(reservation).tone === "visited";

  return (
    <SiteLayout showFooter={false}>
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-12 px-5 py-12 md:gap-20 md:px-8 md:py-20 xl:py-[120px]">
        <ReservationDetailBackLink
          href={ROUTES.reservationDetail(reservationId)}
          label="방문 후기 작성"
          ariaLabel="예약 상세로"
        />
        {isLoading ? (
          <div className="min-h-[420px] animate-pulse rounded-[20px] bg-grayscale-100" />
        ) : error || !canReview || !reservation ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center gap-5 rounded-[20px] bg-white text-center">
            <h1 className="text-heading-2 font-semibold text-grayscale-900">
              후기를 작성할 수 없는 예약이에요
            </h1>
            <Link href={ROUTES.reservationDetail(reservationId)}>
              <BtnCta size="m">예약 상세로</BtnCta>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-7">
            <ReservationRoomSummary reservation={reservation} subtitle="category" />
            <VisitReviewForm reservationId={reservation.id} hostName={reservation.hostName} />
          </div>
        )}
      </div>
    </SiteLayout>
  );
}

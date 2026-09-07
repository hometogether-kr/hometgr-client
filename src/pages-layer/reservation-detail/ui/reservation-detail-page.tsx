"use client";

import Link from "next/link";

import { useMyReservation } from "@/domains/reservation";
import { ROUTES } from "@/shared/config";
import { BtnCta } from "@/shared/ui/btn-cta";
import { ReservationDetail } from "@/widgets/reservation-detail";
import { SiteLayout } from "@/widgets/site-layout";

import { ReservationDetailBackLink } from "./reservation-detail-back-link";

export interface ReservationDetailPageProps {
  reservationId: string;
}

/**
 * 예약 상세 정보 (Figma 5.1.1~5.1.2 · 5.1.4)
 *
 * 상태(승인 대기 · 예약 확정 · 방문 완료 · 취소/거절)에 따라 좌측 카드 스택과 우측
 * 패널의 액션이 달라집니다.
 */
export function ReservationDetailPage({ reservationId }: ReservationDetailPageProps) {
  const { reservation, isLoading, error } = useMyReservation(reservationId);

  return (
    <SiteLayout>
      <div className="mx-auto flex w-full max-w-[1518px] flex-col gap-12 px-5 py-12 md:px-8 md:py-20 xl:px-0 xl:py-[120px]">
        <ReservationDetailBackLink
          href={ROUTES.reservations}
          label="예약 상세 정보"
          ariaLabel="예약 관리 목록으로"
        />
        {isLoading ? (
          <div
            className="min-h-[520px] animate-pulse rounded-[20px] bg-grayscale-100"
            aria-label="예약 상세를 불러오는 중"
          />
        ) : error || !reservation ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center gap-5 rounded-[20px] bg-white text-center">
            <h1 className="text-heading-2 font-semibold text-grayscale-900">
              예약 정보를 불러오지 못했어요
            </h1>
            <p className="text-body-1 text-grayscale-600">
              예약이 없거나 현재 계정으로 확인할 수 없는 예약입니다.
            </p>
            <Link href={ROUTES.reservations}>
              <BtnCta size="m">예약 목록으로</BtnCta>
            </Link>
          </div>
        ) : (
          <ReservationDetail reservation={reservation} />
        )}
      </div>
    </SiteLayout>
  );
}

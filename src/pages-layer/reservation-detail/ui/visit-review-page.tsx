import { type ReservationDetailViewModel,ReservationRoomSummary } from "@/domains/reservation";
import { VisitReviewForm } from "@/features/write-visit-review";
import { ROUTES } from "@/shared/config";
import { SiteLayout } from "@/widgets/site-layout";

import { ReservationDetailBackLink } from "./reservation-detail-back-link";

export interface VisitReviewPageProps {
  reservation: ReservationDetailViewModel;
}

/**
 * 방문 후기 작성 (Figma 5.1.3)
 *
 * 방문 완료 상태의 예약에서만 진입합니다. 라우트에서 상태를 검증합니다.
 */
export function VisitReviewPage({ reservation }: VisitReviewPageProps) {
  return (
    <SiteLayout showFooter={false}>
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-12 px-5 py-12 md:gap-20 md:px-8 md:py-20 xl:py-[120px]">
        <ReservationDetailBackLink
          href={ROUTES.reservationDetail(reservation.id)}
          label="방문 후기 작성"
          ariaLabel="예약 상세로"
        />
        <div className="flex flex-col gap-7">
          <ReservationRoomSummary reservation={reservation} subtitle="category" />
          <VisitReviewForm reservationId={reservation.id} hostName={reservation.hostName} />
        </div>
      </div>
    </SiteLayout>
  );
}

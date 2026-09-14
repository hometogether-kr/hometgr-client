import {
  getReservationDetailPresentation,
  type ReservationDetailViewModel,
  ReservationHostCard,
  ReservationLocationCard,
  ReservationRoomSummary,
  ReservationStatusSummary,
} from "@/domains/reservation";

import { ReservationDetailAside } from "./reservation-detail-aside";

export interface ReservationDetailProps {
  reservation: ReservationDetailViewModel;
}

/**
 * 예약 상세 본문 (Figma 5.1.1~5.1.4)
 *
 * 좌측 968px: 상태별 카드 스택. 승인 대기·확정은 상태 요약이 먼저, 취소/거절은 매물
 * 정보가 먼저 옵니다. 우측 502px: 방문 예약 정보(또는 취소 안내) 패널.
 */
export function ReservationDetail({ reservation }: ReservationDetailProps) {
  const { tone } = getReservationDetailPresentation(reservation);

  const statusCard = <ReservationStatusSummary reservation={reservation} />;

  let leftColumn;
  if (tone === "closed") {
    leftColumn = (
      <>
        <ReservationRoomSummary reservation={reservation} subtitle="location" withRoomLink />
        {statusCard}
      </>
    );
  } else if (tone === "pending") {
    leftColumn = (
      <>
        {statusCard}
        <ReservationRoomSummary reservation={reservation} subtitle="location" withRoomLink />
        <ReservationLocationCard variant="locked" address={reservation.roomAddressText} />
      </>
    );
  } else {
    leftColumn = (
      <>
        {statusCard}
        <ReservationRoomSummary reservation={reservation} subtitle="category" />
        <ReservationLocationCard variant="address" address={reservation.roomAddressText} />
        <ReservationHostCard reservation={reservation} />
      </>
    );
  }

  return (
    <div className="flex flex-col gap-10 xl:flex-row xl:items-start xl:gap-12">
      <div className="flex min-w-0 flex-col gap-7 xl:flex-1">{leftColumn}</div>
      <div className="xl:w-[502px] xl:shrink-0">
        <ReservationDetailAside reservation={reservation} />
      </div>
    </div>
  );
}

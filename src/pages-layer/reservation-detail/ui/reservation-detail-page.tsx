import type { ReservationDetailViewModel } from "@/domains/reservation";
import { ROUTES } from "@/shared/config";
import { ReservationDetail } from "@/widgets/reservation-detail";
import { SiteLayout } from "@/widgets/site-layout";

import { ReservationDetailBackLink } from "./reservation-detail-back-link";

export interface ReservationDetailPageProps {
  reservation: ReservationDetailViewModel;
}

/**
 * 예약 상세 정보 (Figma 5.1.1~5.1.2 · 5.1.4)
 *
 * 상태(승인 대기 · 예약 확정 · 방문 완료 · 취소/거절)에 따라 좌측 카드 스택과 우측
 * 패널의 액션이 달라집니다.
 */
export function ReservationDetailPage({ reservation }: ReservationDetailPageProps) {
  return (
    <SiteLayout>
      <div className="mx-auto flex w-full max-w-[1518px] flex-col gap-12 px-5 py-12 md:px-8 md:py-20 xl:px-0 xl:py-[120px]">
        <ReservationDetailBackLink
          href={ROUTES.reservations}
          label="예약 상세 정보"
          ariaLabel="예약 관리 목록으로"
        />
        <ReservationDetail reservation={reservation} />
      </div>
    </SiteLayout>
  );
}

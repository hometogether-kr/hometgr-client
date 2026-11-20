import type { RoomDetail } from "@/domains/listing";
import { VisitSlotPicker } from "@/features/request-visit";
import { SiteLayout } from "@/widgets/site-layout";

import { RoomReservationSummary } from "./room-reservation-summary";

export interface VisitRequestPageProps {
  room: RoomDetail;
}

export function VisitRequestPage({ room }: VisitRequestPageProps) {
  return (
    <SiteLayout showFooter={false}>
      <div className="mx-auto flex w-full max-w-[1176px] flex-1 flex-col px-4 py-10 md:px-6 md:py-20">
        <header className="mb-8 md:mb-10">
          <h1 className="text-heading-1 font-bold text-grayscale-900 md:text-title-1">
            방문 예약 신청
          </h1>
          <p className="mt-2 text-body-2 text-grayscale-500 md:text-body-1">
            방문하기 좋은 날짜와 시간을 선택해 주세요.
          </p>
        </header>
        <div className="space-y-5 md:space-y-6">
          <RoomReservationSummary room={room} />
          <VisitSlotPicker key={room.id} roomId={room.id} />
        </div>
      </div>
    </SiteLayout>
  );
}

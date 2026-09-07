import { Icon } from "@/shared/ui/icons";

import type { ReservationDetailViewModel } from "../model/reservation-detail.types";

type HostFields = Pick<
  ReservationDetailViewModel,
  "hostName" | "hostResponseRate" | "hostJoinedLabel" | "hostResidenceNote"
>;

export interface ReservationHostCardProps {
  reservation: HostFields;
}

/**
 * 호스트 정보 카드 (Figma 5.1.2 "호스트 정보")
 *
 * 예약 확정 이후 화면에서만 노출됩니다.
 */
export function ReservationHostCard({ reservation }: ReservationHostCardProps) {
  return (
    <section className="flex flex-col gap-6 rounded-[20px] border-[1.4px] border-grayscale-200 bg-white px-9 py-8">
      <h2 className="text-title-3 font-semibold text-grayscale-900">호스트 정보</h2>
      <div className="flex items-center gap-6">
        <span className="flex size-16 shrink-0 items-end justify-center overflow-hidden rounded-full bg-grayscale-70 text-grayscale-300">
          <Icon name="person" size={56} filled className="translate-y-[14%]" />
        </span>
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="text-title-3 font-semibold text-grayscale-900">
              {reservation.hostName} 집주인
            </p>
            <span className="flex items-center gap-3 text-body-1 font-medium">
              <span className="text-grayscale-600">
                응답률 <span className="text-grayscale-800">{reservation.hostResponseRate}%</span>
              </span>
              <span className="h-3.5 w-px bg-grayscale-300" aria-hidden="true" />
              <span className="text-grayscale-600">
                가입일 <span className="text-grayscale-800">{reservation.hostJoinedLabel}</span>
              </span>
            </span>
          </div>
          <p className="text-body-1 font-medium text-primary-500">{reservation.hostResidenceNote}</p>
        </div>
      </div>
    </section>
  );
}

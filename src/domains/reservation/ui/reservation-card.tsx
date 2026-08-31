import { BtnCta } from "@/shared/ui/btn-cta";

import { formatReservationDateTime, getVisitDayDifference } from "../lib/format-reservation-date";
import { getReservationTab } from "../lib/get-reservation-tab";
import type { ReservationCardViewModel } from "../model/reservation.types";
import { ReservationStatusChip } from "./reservation-status-chip";
import { ReservationThumbnail } from "./reservation-thumbnail";

export interface ReservationCardActions {
  onDetail?: () => void;
  onReschedule?: () => void;
  onReview?: () => void;
}

export interface ReservationCardProps {
  reservation: ReservationCardViewModel;
  actions?: ReservationCardActions;
  eagerImage?: boolean;
}

function getPrimaryVisitTime(reservation: ReservationCardViewModel): string | null {
  return reservation.scheduledVisitTime ?? reservation.requestedVisitTimes[0] ?? null;
}

function ActionButton({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <BtnCta
      variant="stroke"
      size="s"
      className="w-full md:w-auto"
      onClick={onClick}
      disabled={!onClick}
      title={!onClick ? "연결 화면 준비 중" : undefined}
    >
      {label}
    </BtnCta>
  );
}

export function ReservationCard({ reservation, actions, eagerImage = false }: ReservationCardProps) {
  const tab = getReservationTab(reservation.status);
  const visitTime = getPrimaryVisitTime(reservation);
  const dateLabel = tab === "pending" ? "신청 일시" : "방문 일시";
  const dDay = reservation.scheduledVisitTime
    ? getVisitDayDifference(reservation.scheduledVisitTime)
    : null;

  return (
    <article className="flex flex-col gap-5 rounded-[20px] border border-grayscale-200 bg-white p-5 md:min-h-[191px] md:flex-row md:items-center md:gap-7 md:p-7">
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-[10px] md:h-[135px] md:w-[180px]">
        <ReservationThumbnail
          src={reservation.roomThumbnailUrl}
          alt={reservation.roomTitle}
          eager={eagerImage}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 space-y-4">
          <div className="space-y-1.5">
            <p className="truncate text-headline-1 font-semibold text-grayscale-900">
              {reservation.roomTitle}
            </p>
            <p className="text-label-1 text-grayscale-500">
              {reservation.hostDisplayName
                ? `호스트 ${reservation.hostDisplayName}`
                : "호스트 정보 준비 중"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-label-2 font-medium text-grayscale-500">{dateLabel}</p>
            {visitTime ? (
              <time dateTime={visitTime} className="text-body-1 font-semibold text-grayscale-800">
                {formatReservationDateTime(visitTime)}
              </time>
            ) : (
              <p className="text-body-1 font-semibold text-grayscale-600">일정 확인 중</p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-4 md:items-end">
          <div className="flex flex-wrap items-center gap-2">
            {tab === "confirmed" && dDay !== null && dDay >= 0 && (
              <span className="inline-flex h-8 items-center rounded-full bg-primary-500 px-3 text-label-2 font-bold text-white">
                {dDay === 0 ? "D-DAY" : `D-${dDay}`}
              </span>
            )}
            <ReservationStatusChip status={reservation.status} />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <ActionButton label="상세 보기" onClick={actions?.onDetail} />
            {(tab === "pending" || tab === "confirmed") && (
              <ActionButton label="일정 변경하기" onClick={actions?.onReschedule} />
            )}
            {tab === "visited" && (
              <ActionButton label="후기 작성하기" onClick={actions?.onReview} />
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

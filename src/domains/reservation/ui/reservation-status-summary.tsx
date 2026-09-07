import { cn } from "@/shared/lib/cn";
import { Divider } from "@/shared/ui/divider";
import { Icon } from "@/shared/ui/icons";

import { getVisitDayDifference } from "../lib/format-reservation-date";
import type { ReservationDetailViewModel } from "../model/reservation-detail.types";
import {
  getReservationDetailPresentation,
  type ReservationDetailPresentation,
} from "../model/reservation-detail-presentation";

const CARD = "rounded-[20px] border-[1.4px] border-grayscale-200 bg-white px-9 py-8";

function StatusBadge({ badge, iconName }: Pick<ReservationDetailPresentation, "badge" | "iconName">) {
  if (badge === "check-32") {
    return (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-grayscale-800 text-white">
        <Icon name={iconName} size={20} />
      </span>
    );
  }
  if (badge === "error-76") {
    return (
      <span className="flex size-[76px] shrink-0 items-center justify-center rounded-full bg-system-error text-white">
        <Icon name={iconName} size={40} />
      </span>
    );
  }
  return (
    <span className="flex size-[90px] shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-500">
      <Icon name={iconName} size={48} filled />
    </span>
  );
}

function StatusHeader({ presentation }: { presentation: ReservationDetailPresentation }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <h2 className="text-title-3 font-semibold text-grayscale-900">{presentation.headline}</h2>
      <p className="text-body-1 font-medium text-grayscale-600">{presentation.description}</p>
    </div>
  );
}

function DetailRow({
  label,
  value,
  withCheck,
}: {
  label: string;
  value: string;
  withCheck: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col gap-3">
      <p className="text-headline-1 font-normal text-grayscale-700">{label}</p>
      <div className="flex items-center gap-3">
        {withCheck && (
          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-grayscale-800 text-white">
            <Icon name="check" size={14} />
          </span>
        )}
        <p className="text-heading-2 font-semibold text-grayscale-900">{value}</p>
      </div>
    </div>
  );
}

export interface ReservationStatusSummaryProps {
  reservation: ReservationDetailViewModel;
}

/**
 * 예약 상태 요약 카드 (Figma 5.1.1~5.1.4 상단)
 *
 * - 승인 대기: 90px 배지 + 호스트/추천 시간 행(체크 아이콘) + D-day 없음
 * - 예약 확정: 32px 체크 배지 + D-day 배지, 부가 행 없음
 * - 취소/거절: 76px 에러 배지 + 호스트/거절 사유 행(체크 없음)
 */
export function ReservationStatusSummary({ reservation }: ReservationStatusSummaryProps) {
  const presentation = getReservationDetailPresentation(reservation);
  const hostLabel = `${reservation.hostName} 집주인`;

  if (presentation.tone === "confirmed" || presentation.tone === "visited") {
    const dDay =
      presentation.tone === "confirmed" && reservation.scheduledVisitTime
        ? getVisitDayDifference(reservation.scheduledVisitTime)
        : null;

    return (
      <section className={cn(CARD, "flex items-center gap-6")}>
        <div className="flex min-w-0 flex-1 items-center gap-5">
          <StatusBadge badge={presentation.badge} iconName={presentation.iconName} />
          <StatusHeader presentation={presentation} />
        </div>
        {dDay !== null && dDay >= 0 && (
          <span className="shrink-0 rounded-[10px] bg-grayscale-100 px-3 py-1.5 text-body-1 font-semibold text-primary-500">
            {dDay === 0 ? "D-DAY" : `D-${dDay}`}
          </span>
        )}
      </section>
    );
  }

  const isPending = presentation.tone === "pending";

  return (
    <section className={cn(CARD, "flex flex-col gap-6")}>
      <div className="flex items-center gap-7">
        <StatusBadge badge={presentation.badge} iconName={presentation.iconName} />
        <StatusHeader presentation={presentation} />
      </div>
      <Divider />
      <div className={cn("flex flex-col", isPending ? "gap-5 sm:flex-row" : "gap-6")}>
        <DetailRow label="호스트 정보" value={hostLabel} withCheck={isPending} />
        {isPending ? (
          <DetailRow label="집주인 추천 시간" value={reservation.hostSuggestedTime} withCheck />
        ) : (
          <DetailRow label="거절 사유" value={reservation.rejectionReason} withCheck={false} />
        )}
      </div>
    </section>
  );
}

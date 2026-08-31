import { cn } from "@/shared/lib/cn";

import { getReservationStatusDisplay } from "../model/reservation-status";
import type { ReservationStatus } from "../model/reservation.types";

export interface ReservationStatusChipProps {
  status: ReservationStatus;
}

const toneClasses = {
  pending: "border-status-pending-border bg-status-pending-soft text-status-pending",
  confirmed: "border-primary-200 bg-primary-50 text-primary-600",
  visited: "border-grayscale-300 bg-grayscale-70 text-grayscale-700",
  closed: "border-grayscale-200 bg-grayscale-100 text-grayscale-500",
} as const;

export function ReservationStatusChip({ status }: ReservationStatusChipProps) {
  const display = getReservationStatusDisplay(status);

  return (
    <span
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-label-2 font-semibold",
        toneClasses[display.tone],
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {display.label}
    </span>
  );
}

import { cn } from "@/shared/lib/cn";

import type { VisitTimeSlot } from "../model/visit-request.types";

const timeFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export interface TimeSlotGridProps {
  slots: VisitTimeSlot[];
  selectedVisitTimes: string[];
  onSlotToggle: (startsAt: string) => void;
}

export function TimeSlotGrid({ slots, selectedVisitTimes, onSlotToggle }: TimeSlotGridProps) {
  if (slots.length === 0) {
    return (
      <div className="flex min-h-40 items-center justify-center rounded-xl bg-grayscale-70 px-5 text-center text-body-2 text-grayscale-500">
        선택할 수 있는 방문 시간이 없어요.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {slots.map((slot) => {
        const selected = selectedVisitTimes.includes(slot.startsAt);
        const isPast = new Date(slot.startsAt).getTime() <= Date.now();
        const disabled = !slot.available || isPast;

        return (
          <button
            key={slot.startsAt}
            type="button"
            disabled={disabled}
            aria-pressed={selected}
            onClick={() => onSlotToggle(slot.startsAt)}
            className={cn(
              "h-12 rounded-[10px] border text-label-1 font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-grayscale-200 disabled:bg-grayscale-70 disabled:text-grayscale-300",
              selected
                ? "border-primary-500 bg-primary-100 text-primary-600"
                : "border-grayscale-300 bg-white text-grayscale-700 hover:border-primary-400",
            )}
          >
            <time dateTime={slot.startsAt}>{timeFormatter.format(new Date(slot.startsAt))}</time>
          </button>
        );
      })}
    </div>
  );
}

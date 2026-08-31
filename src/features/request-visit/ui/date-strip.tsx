import { cn } from "@/shared/lib/cn";

import type { VisitDateOption } from "../model/visit-request.types";

const monthDayFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  month: "numeric",
  day: "numeric",
});

const weekdayFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  weekday: "short",
});

export interface DateStripProps {
  dates: VisitDateOption[];
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

function toDate(date: string): Date {
  return new Date(`${date}T00:00:00+09:00`);
}

export function DateStrip({ dates, selectedDate, onDateSelect }: DateStripProps) {
  return (
    <div className="-mx-5 [scrollbar-width:none] overflow-x-auto px-5 pb-1 md:mx-0 md:px-0">
      <div className="flex min-w-max gap-2" role="group" aria-label="방문 날짜 선택">
        {dates.map((option) => {
          const active = selectedDate === option.date;
          const date = toDate(option.date);

          return (
            <button
              key={option.date}
              type="button"
              aria-pressed={active}
              onClick={() => onDateSelect(option.date)}
              className={cn(
                "flex h-[74px] w-[72px] shrink-0 flex-col items-center justify-center rounded-xl border text-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 md:w-[84px]",
                active
                  ? "border-primary-500 bg-primary-500 text-white"
                  : "border-grayscale-200 bg-white text-grayscale-600 hover:border-primary-300",
              )}
            >
              <span className="text-caption-1 font-medium">{weekdayFormatter.format(date)}</span>
              <span className="mt-1 text-body-1 font-bold">{monthDayFormatter.format(date)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

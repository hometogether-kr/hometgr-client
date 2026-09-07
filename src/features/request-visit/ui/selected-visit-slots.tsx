import { formatReservationDateTime } from "@/domains/reservation";
import { Icon } from "@/shared/ui/icons";

export interface SelectedVisitSlotsProps {
  selectedVisitTimes: string[];
  onRemove: (startsAt: string) => void;
}

export function SelectedVisitSlots({ selectedVisitTimes, onRemove }: SelectedVisitSlotsProps) {
  if (selectedVisitTimes.length === 0) {
    return (
      <p className="text-body-2 text-grayscale-500">아래에서 희망 날짜와 시간을 선택해 주세요.</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {selectedVisitTimes.map((startsAt) => {
        const label = formatReservationDateTime(startsAt);
        return (
          <span
            key={startsAt}
            className="inline-flex min-h-9 items-center gap-1 rounded-full bg-primary-100 py-1.5 pr-1.5 pl-3 text-label-2 font-semibold text-primary-600"
          >
            <time dateTime={startsAt}>{label}</time>
            <button
              type="button"
              onClick={() => onRemove(startsAt)}
              aria-label={`${label} 선택 해제`}
              className="flex size-7 items-center justify-center rounded-full outline-none hover:bg-primary-200 focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <Icon name="close" size={16} />
            </button>
          </span>
        );
      })}
    </div>
  );
}

import type { VisitRequestContext } from "@/domains/reservation";

import type { VisitDateOption } from "./visit-request.types";

const DAY_MS = 24 * 60 * 60 * 1_000;
const SEOUL_OFFSET = "+09:00";

export function createVisitDateOptions({
  policy,
  blockedSlots,
  serverNow,
}: VisitRequestContext): VisitDateOption[] {
  const firstDay = Date.parse(policy.firstDate);
  const lastDay = Date.parse(policy.lastDate);
  const slotDuration = policy.slotDurationMinutes * 60_000;
  const now = Date.parse(serverNow);
  const blockedIntervals = blockedSlots.map(({ startsAt, endsAt }) => ({
    start: Date.parse(startsAt),
    end: Date.parse(endsAt),
  }));

  return Array.from({ length: (lastDay - firstDay) / DAY_MS + 1 }, (_, index) => {
    const date = new Date(firstDay + index * DAY_MS).toISOString().slice(0, 10);

    return {
      date,
      slots: policy.allowedLocalTimes.map((time) => {
        const startsAt = `${date}T${time}:00${SEOUL_OFFSET}`;
        const start = Date.parse(startsAt);
        const end = start + slotDuration;

        return {
          startsAt,
          available:
            start > now &&
            !blockedIntervals.some((blocked) => start < blocked.end && blocked.start < end),
        };
      }),
    };
  });
}

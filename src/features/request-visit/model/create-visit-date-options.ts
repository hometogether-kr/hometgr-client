import type { VisitDateOption } from "./visit-request.types";

const SEOUL_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAYS_TO_SHOW = 7;
const VISIT_HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17];

function toSeoulDateString(date: Date): string {
  const seoul = new Date(date.getTime() + SEOUL_OFFSET_MS);
  const year = seoul.getUTCFullYear();
  const month = String(seoul.getUTCMonth() + 1).padStart(2, "0");
  const day = String(seoul.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** 별도 가용 시간 API가 없어 내일부터 7일간 기본 방문 시간을 제시합니다. */
export function createVisitDateOptions(now = new Date()): VisitDateOption[] {
  return Array.from({ length: DAYS_TO_SHOW }, (_, index) => {
    const date = new Date(now.getTime() + (index + 1) * 24 * 60 * 60 * 1000);
    const dateText = toSeoulDateString(date);

    return {
      date: dateText,
      slots: VISIT_HOURS.map((hour) => ({
        startsAt: `${dateText}T${String(hour).padStart(2, "0")}:00:00+09:00`,
        available: true,
      })),
    };
  });
}

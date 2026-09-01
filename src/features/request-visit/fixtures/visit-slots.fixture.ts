import type { VisitDateOption } from "../model/visit-request.types";

const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17];

function createSlots(date: string, unavailableHours: number[] = []) {
  return hours.map((hour) => ({
    startsAt: `${date}T${String(hour).padStart(2, "0")}:00:00+09:00`,
    available: !unavailableHours.includes(hour),
  }));
}

export const visitDateFixtures: VisitDateOption[] = [
  { date: "2026-08-31", slots: createSlots("2026-08-31", [9, 10, 14]) },
  { date: "2026-09-01", slots: createSlots("2026-09-01", [12, 15]) },
  { date: "2026-09-02", slots: createSlots("2026-09-02", [10, 11, 16]) },
  { date: "2026-09-03", slots: createSlots("2026-09-03", [13]) },
  { date: "2026-09-04", slots: createSlots("2026-09-04", [9, 17]) },
  { date: "2026-09-05", slots: createSlots("2026-09-05", [12, 13, 14]) },
  { date: "2026-09-06", slots: [] },
];

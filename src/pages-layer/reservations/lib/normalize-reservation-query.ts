import type { ReservationTab } from "@/domains/reservation";

const reservationTabs: ReservationTab[] = ["all", "pending", "confirmed", "visited", "closed"];

export function normalizeReservationTab(value: string | string[] | undefined): ReservationTab {
  const candidate = Array.isArray(value) ? value[0] : value;
  return reservationTabs.includes(candidate as ReservationTab)
    ? (candidate as ReservationTab)
    : "all";
}

export function normalizeReservationPage(value: string | string[] | undefined): number {
  const candidate = Array.isArray(value) ? value[0] : value;
  const parsed = Number(candidate);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

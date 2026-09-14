import type { ReservationStatus, ReservationTab } from "../model/reservation.types";
import { getReservationStatusDisplay } from "../model/reservation-status";

export function getReservationTab(status: ReservationStatus): Exclude<ReservationTab, "all"> {
  return getReservationStatusDisplay(status).tab;
}

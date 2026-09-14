import type { ReservationStatus, ReservationTab } from "./reservation.types";

interface ReservationStatusDisplay {
  label: string;
  tab: Exclude<ReservationTab, "all">;
  tone: "pending" | "confirmed" | "visited" | "closed";
}

const reservationStatusDisplay: Record<ReservationStatus, ReservationStatusDisplay> = {
  requested: { label: "승인 대기", tab: "pending", tone: "pending" },
  hostViewed: { label: "승인 대기", tab: "pending", tone: "pending" },
  accepted: { label: "예약 확정", tab: "confirmed", tone: "confirmed" },
  visitScheduled: { label: "예약 확정", tab: "confirmed", tone: "confirmed" },
  visitCompleted: { label: "방문 완료", tab: "visited", tone: "visited" },
  contractPending: { label: "방문 완료", tab: "visited", tone: "visited" },
  contractSent: { label: "방문 완료", tab: "visited", tone: "visited" },
  contractSigned: { label: "방문 완료", tab: "visited", tone: "visited" },
  paymentPending: { label: "방문 완료", tab: "visited", tone: "visited" },
  paymentCompleted: { label: "방문 완료", tab: "visited", tone: "visited" },
  completed: { label: "방문 완료", tab: "visited", tone: "visited" },
  checkoutPending: { label: "방문 완료", tab: "visited", tone: "visited" },
  checkoutCompleted: { label: "방문 완료", tab: "visited", tone: "visited" },
  rejected: { label: "예약 거절", tab: "closed", tone: "closed" },
  cancelledByStudent: { label: "예약 취소", tab: "closed", tone: "closed" },
  cancelledByHost: { label: "예약 취소", tab: "closed", tone: "closed" },
  expired: { label: "기간 만료", tab: "closed", tone: "closed" },
};

export function getReservationStatusDisplay(status: ReservationStatus): ReservationStatusDisplay {
  return reservationStatusDisplay[status];
}

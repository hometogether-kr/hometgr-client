export type ReservationStatus =
  | "requested"
  | "hostViewed"
  | "accepted"
  | "rejected"
  | "visitScheduled"
  | "visitCompleted"
  | "contractPending"
  | "contractSent"
  | "contractSigned"
  | "paymentPending"
  | "paymentCompleted"
  | "cancelledByStudent"
  | "cancelledByHost"
  | "expired"
  | "completed"
  | "checkoutPending"
  | "checkoutCompleted";

export type ReservationTab = "all" | "pending" | "confirmed" | "visited" | "closed";

export interface ReservationCardViewModel {
  id: string;
  roomId: string;
  roomTitle: string;
  roomThumbnailUrl: string | null;
  hostDisplayName: string | null;
  status: ReservationStatus;
  requestedVisitTimes: string[];
  scheduledVisitTime: string | null;
  createdAt: string;
  expiresAt: string;
}

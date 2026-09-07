import { reservationDetailOverlays } from "../fixtures/reservation-details.fixture";
import { reservationFixtures } from "../fixtures/reservations.fixture";
import type { ReservationDetailViewModel } from "../model/reservation-detail.types";

function buildReservationNumber(id: string): string {
  const serial = id.replace(/\D/g, "").padStart(4, "0").slice(-4);
  return `HM-2026-${serial}`;
}

/**
 * 예약 상세 뷰모델 조회
 *
 * 목록 fixture에서 예약을 찾고, 상세 전용 overlay를 덮어씁니다. 존재하지 않는
 * id면 null을 돌려주며, 라우트에서 `notFound()` 처리합니다.
 */
export function getReservationDetailById(id: string): ReservationDetailViewModel | null {
  const card = reservationFixtures.find((reservation) => reservation.id === id);
  if (!card) return null;

  const overlay = reservationDetailOverlays[id] ?? {};

  return {
    id: card.id,
    reservationNumber: overlay.reservationNumber ?? buildReservationNumber(card.id),
    status: card.status,
    scheduleChangeRequested: overlay.scheduleChangeRequested ?? false,

    roomId: card.roomId,
    roomTitle: overlay.roomTitle ?? card.roomTitle,
    roomThumbnailUrl: overlay.roomThumbnailUrl ?? card.roomThumbnailUrl,
    roomLocationText: overlay.roomLocationText ?? "위치 정보 준비 중",
    roomCategoryText: overlay.roomCategoryText ?? "매물 정보 준비 중",
    roomAddressText: overlay.roomAddressText ?? "방문 확정 후 상세 주소가 공개됩니다.",

    hostName: overlay.hostName ?? card.hostDisplayName ?? "집주인",
    hostResponseRate: overlay.hostResponseRate ?? 0,
    hostJoinedLabel: overlay.hostJoinedLabel ?? "",
    hostResidenceNote: overlay.hostResidenceNote ?? "",

    hostSuggestedTime: overlay.hostSuggestedTime ?? "조율 전",
    rejectionReason: overlay.rejectionReason ?? "사유가 전달되지 않았습니다.",
    scheduledVisitTime: card.scheduledVisitTime,

    visitorCountLabel: overlay.visitorCountLabel ?? "성인 1명",
  };
}

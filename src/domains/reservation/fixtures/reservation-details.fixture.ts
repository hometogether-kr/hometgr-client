/**
 * 예약 상세 전용 필드 (목록 fixture에 없는 값)
 *
 * 백엔드 연동 전까지 Figma 5.1.1~5.1.4 화면을 확인하기 위한 더미입니다. id별로 필요한
 * 항목만 채우고, 나머지는 {@link getReservationDetailById}에서 기본값으로 메웁니다.
 */
export interface ReservationDetailOverlay {
  reservationNumber?: string;
  scheduleChangeRequested?: boolean;
  roomTitle?: string;
  roomThumbnailUrl?: string;
  roomLocationText?: string;
  roomCategoryText?: string;
  roomAddressText?: string;
  hostName?: string;
  hostResponseRate?: number;
  hostJoinedLabel?: string;
  hostResidenceNote?: string;
  hostSuggestedTime?: string;
  rejectionReason?: string;
  visitorCountLabel?: string;
}

const sharedRoom = {
  roomTitle: "노원구 동부 아파트",
  roomThumbnailUrl: "/figma/room-photo-7451d61e.png",
  roomLocationText: "역삼동 · 강남역 도보 5분",
  roomCategoryText: "아파트·서울특별시",
  roomAddressText: "노원구 공릉로 487길 14-5 12층",
  hostName: "김현수",
  hostResponseRate: 85,
  hostJoinedLabel: "2022년 5월",
  hostResidenceNote: "호스트가 집에 함께 거주해요",
  hostSuggestedTime: "주중 오전이 편하시대요",
  visitorCountLabel: "성인 2명",
} satisfies ReservationDetailOverlay;

export const reservationDetailOverlays: Record<string, ReservationDetailOverlay> = {
  // Figma 5.1.1 — 승인 대기 중
  "reservation-002": { ...sharedRoom, reservationNumber: "HM-2024-X9A2" },
  // Figma 5.1.1 — 일정 변경 요청됨
  "reservation-003": {
    ...sharedRoom,
    reservationNumber: "HM-2024-X9A2",
    scheduleChangeRequested: true,
  },
  // Figma 5.1.2 — 예약 확정
  "reservation-004": { ...sharedRoom, reservationNumber: "HM-2024-X9A2" },
  // Figma 5.1.3 — 방문 완료 후기
  "reservation-005": { ...sharedRoom, reservationNumber: "HM-2024-X9A2" },
  // Figma 5.1.4 — 예약 취소/거절
  "reservation-008": {
    ...sharedRoom,
    reservationNumber: "HM-2024-X9A2",
    rejectionReason: "거절사유 보내기 거절사유 더미텍스트",
  },
};

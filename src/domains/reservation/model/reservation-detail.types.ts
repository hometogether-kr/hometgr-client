import type { ReservationStatus } from "./reservation.types";

/**
 * 예약 상세 화면이 쓰는 뷰모델
 *
 * 목록 카드({@link ReservationCardViewModel})보다 항목이 많습니다. Figma 5.1.1~5.1.4
 * (예약 상세 정보 · 방문 후기 작성)의 모든 텍스트를 담습니다. API가 제공하지 않는
 * 호스트·사진·상세 주소 항목은 매퍼가 정보 없음 상태로 정규화합니다.
 */
export interface ReservationDetailViewModel {
  id: string;
  /** 표시용 예약 번호 (예: HM-2024-X9A2) */
  reservationNumber: string;
  status: ReservationStatus;
  /** 집주인이 새 일정을 역제안한 승인 대기 하위 상태 (Figma 5.1.1 "일정 변경 요청됨") */
  scheduleChangeRequested: boolean;

  roomId: string;
  roomTitle: string;
  roomThumbnailUrl: string | null;
  /** "역삼동 · 강남역 도보 5분" — 대기/취소 화면의 매물 카드 부제 */
  roomLocationText: string;
  /** "아파트·서울특별시" — 확정/후기 화면의 매물 카드 부제 */
  roomCategoryText: string;
  /** "노원구 공릉로 487길 14-5 12층" — 확정 이후에만 공개되는 상세 주소 */
  roomAddressText: string;

  hostName: string;
  /** 집주인 응답률 (%) — 확정 화면 호스트 카드 */
  hostResponseRate: number;
  /** "2022년 5월" — 가입일 라벨 */
  hostJoinedLabel: string;
  /** "호스트가 집에 함께 거주해요" — 호스트 카드 하단 안내 */
  hostResidenceNote: string;

  /** "주중 오전이 편하시대요" — 집주인 추천 시간 */
  hostSuggestedTime: string;
  /** 거절 사유 — status가 취소/거절일 때 표시 */
  rejectionReason: string;
  /** 확정된 방문 시간 (ISO 8601). D-day 계산에 사용 */
  scheduledVisitTime: string | null;

  /** "성인 2명" — 방문 인원 라벨 */
  visitorCountLabel: string;
}

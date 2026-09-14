import type { ReservationDetailViewModel } from "./reservation-detail.types";
import { getReservationStatusDisplay } from "./reservation-status";

export type ReservationDetailTone = "pending" | "confirmed" | "visited" | "closed";

export interface ReservationDetailPresentation {
  tone: ReservationDetailTone;
  /** 상태 요약 카드의 큰 제목 (Figma) */
  headline: string;
  /** 제목 아래 한 줄 설명 */
  description: string;
  /** 상태 아이콘 (Material Symbols) */
  iconName: string;
  /** 아이콘 배지 스타일 */
  badge: "primary-90" | "check-32" | "error-76";
  /** 사이드 패널 "일정" 행 문구 */
  scheduleLabel: string;
}

/**
 * 예약 상태 → 상세 화면 표현 (Figma 5.1.1~5.1.4)
 *
 * 승인 대기는 집주인의 일정 역제안 여부(`scheduleChangeRequested`)에 따라 제목·아이콘이
 * 갈립니다.
 */
export function getReservationDetailPresentation(
  reservation: Pick<ReservationDetailViewModel, "status" | "scheduleChangeRequested">,
): ReservationDetailPresentation {
  const tone = getReservationStatusDisplay(reservation.status).tone;

  if (tone === "pending") {
    return reservation.scheduleChangeRequested
      ? {
          tone,
          headline: "일정 변경 요청됨",
          description:
            "집주인이 새로운 방문 일정을 제안했습니다. 추천 시간을 확인하고 일정을 변경해 주세요.",
          iconName: "event_available",
          badge: "primary-90",
          scheduleLabel: "조율 중",
        }
      : {
          tone,
          headline: "승인 대기 중",
          description: "집주인이 예약을 확인하고 있습니다.",
          iconName: "refresh",
          badge: "primary-90",
          scheduleLabel: "조율 중",
        };
  }

  if (tone === "confirmed") {
    return {
      tone,
      headline: "예약 확정",
      description: "집주인이 방문을 승인했습니다.",
      iconName: "check",
      badge: "check-32",
      scheduleLabel: "예약 확정",
    };
  }

  if (tone === "visited") {
    return {
      tone,
      headline: "방문 완료",
      description: "방문이 완료됐어요. 후기를 남겨보세요.",
      iconName: "check",
      badge: "check-32",
      scheduleLabel: "방문 완료",
    };
  }

  return {
    tone,
    headline: "예약 취소/거절",
    description: "예약이 취소되었거나 거절되었습니다.",
    iconName: "close",
    badge: "error-76",
    scheduleLabel: "취소/거절",
  };
}

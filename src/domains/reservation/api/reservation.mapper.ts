import type { ReservationCardViewModel } from "../model/reservation.types";
import type { ReservationDetailViewModel } from "../model/reservation-detail.types";
import type { StudentReservationResponseDto } from "./reservation.dto";

const PROPERTY_LABELS: Record<string, string> = {
  apartment: "아파트",
  officetel: "오피스텔",
  villa: "빌라",
  detachedHouse: "단독주택",
  oneRoom: "원룸",
};

const REJECT_REASON_LABELS: Record<string, string> = {
  alreadyInProgress: "다른 예약이 진행 중입니다.",
  moveInDateMismatch: "희망 입주일이 맞지 않습니다.",
  stayPeriodMismatch: "희망 거주 기간이 맞지 않습니다.",
  conditionMismatch: "희망 조건이 맞지 않습니다.",
  other: "집주인 사정으로 예약이 거절되었습니다.",
};

function requestedVisitTimes(dto: StudentReservationResponseDto): string[] {
  return [dto.visitRequestDate1, dto.visitRequestDate2, dto.visitRequestDate3].filter(
    (value): value is string => value !== null,
  );
}

function roomTitle(dto: StudentReservationResponseDto): string {
  return dto.room.title ?? dto.room.approximateLocation ?? dto.room.addressRegion ?? "매물 정보";
}

function reservationNumber(dto: StudentReservationResponseDto): string {
  const year = new Date(dto.createdAt).getFullYear();
  return `HM-${year}-${dto.id.slice(0, 8).toUpperCase()}`;
}

export function toReservationCard(dto: StudentReservationResponseDto): ReservationCardViewModel {
  return {
    id: dto.id,
    roomId: dto.roomId,
    roomTitle: roomTitle(dto),
    roomThumbnailUrl: null,
    hostDisplayName: null,
    status: dto.reservationStatus,
    requestedVisitTimes: requestedVisitTimes(dto),
    scheduledVisitTime: dto.visitScheduledAt,
    createdAt: dto.createdAt,
    expiresAt: dto.expiresAt,
  };
}

export function toReservationDetail(
  dto: StudentReservationResponseDto,
): ReservationDetailViewModel {
  const property = dto.room.buildingType ?? dto.room.propertyType;
  const propertyLabel = property ? (PROPERTY_LABELS[property] ?? property) : "매물";
  const location = [dto.room.addressRegion, dto.room.approximateLocation]
    .filter(Boolean)
    .join(" · ");
  const rejectionReason =
    dto.rejectMessage ??
    (dto.rejectReason ? REJECT_REASON_LABELS[dto.rejectReason] : null) ??
    "사유가 전달되지 않았습니다.";

  return {
    id: dto.id,
    reservationNumber: reservationNumber(dto),
    status: dto.reservationStatus,
    scheduleChangeRequested: false,
    roomId: dto.roomId,
    roomTitle: roomTitle(dto),
    roomThumbnailUrl: null,
    roomLocationText: location || "위치 정보 없음",
    roomCategoryText: [propertyLabel, dto.room.addressRegion].filter(Boolean).join(" · "),
    roomAddressText: dto.room.addressRegion ?? "상세 주소는 집주인에게 확인해 주세요.",
    hostName: "",
    hostResponseRate: null,
    hostJoinedLabel: "정보 없음",
    hostResidenceNote: "",
    hostSuggestedTime: "조율 중",
    rejectionReason,
    scheduledVisitTime: dto.visitScheduledAt,
    visitorCountLabel: "정보 없음",
  };
}

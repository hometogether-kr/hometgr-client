import { apiRequest } from "@/shared/api";

import type { ReservationCardViewModel } from "../model/reservation.types";
import type { ReservationDetailViewModel } from "../model/reservation-detail.types";
import {
  reservationResponseDtoSchema,
  studentReservationResponseDtoSchema,
} from "./reservation.dto";
import { toReservationCard, toReservationDetail } from "./reservation.mapper";

export async function fetchMyReservations(
  signal?: AbortSignal,
): Promise<ReservationCardViewModel[]> {
  const items = await apiRequest({
    path: "/me/reservations",
    schema: studentReservationResponseDtoSchema.array(),
    signal,
  });
  return items.map(toReservationCard);
}

export async function fetchMyReservation(
  reservationId: string,
  signal?: AbortSignal,
): Promise<ReservationDetailViewModel> {
  const dto = await apiRequest({
    path: `/me/reservations/${encodeURIComponent(reservationId)}`,
    schema: studentReservationResponseDtoSchema,
    signal,
  });
  return toReservationDetail(dto);
}

/** 호스트 상세 응답은 공통 예약 필드만 포함합니다. */
export async function fetchHostReservationResponse(reservationId: string, signal?: AbortSignal) {
  return apiRequest({
    path: `/host/reservations/${encodeURIComponent(reservationId)}`,
    schema: reservationResponseDtoSchema,
    signal,
  });
}

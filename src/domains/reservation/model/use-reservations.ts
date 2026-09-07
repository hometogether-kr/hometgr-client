"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchMyReservation, fetchMyReservations } from "../api/reservation.api";
import { reservationQueryKeys } from "../api/reservation-query-keys";

export function useMyReservations() {
  const query = useQuery({
    queryKey: reservationQueryKeys.mine(),
    queryFn: ({ signal }) => fetchMyReservations(signal),
  });

  return {
    reservations: query.data ?? [],
    isLoading: query.isPending,
    error: query.error,
  };
}

export function useMyReservation(reservationId: string) {
  const query = useQuery({
    queryKey: reservationQueryKeys.detail(reservationId),
    queryFn: ({ signal }) => fetchMyReservation(reservationId, signal),
    enabled: reservationId.length > 0,
  });

  return {
    reservation: query.data ?? null,
    isLoading: query.isPending,
    error: query.error,
  };
}

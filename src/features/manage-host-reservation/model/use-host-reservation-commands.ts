"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { reservationQueryKeys, toHostReservation } from "@/domains/reservation";

import { acceptHostReservation, rejectHostReservation } from "../api/host-reservation-command.api";

export function useHostReservationCommands() {
  const queryClient = useQueryClient();

  const updateDetail = (
    reservationId: string,
    response: Parameters<typeof toHostReservation>[0],
  ) => {
    queryClient.setQueryData(
      reservationQueryKeys.hostDetail(reservationId),
      toHostReservation(response),
    );
  };

  const acceptMutation = useMutation({
    mutationFn: acceptHostReservation,
    onSuccess: (response, reservationId) => updateDetail(reservationId, response),
  });
  const rejectMutation = useMutation({
    mutationFn: rejectHostReservation,
    onSuccess: (response, input) => updateDetail(input.reservationId, response),
  });

  return {
    acceptReservation: acceptMutation.mutateAsync,
    rejectReservation: rejectMutation.mutateAsync,
    isSubmitting: acceptMutation.isPending || rejectMutation.isPending,
  };
}

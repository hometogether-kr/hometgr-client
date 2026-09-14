"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { reservationQueryKeys } from "@/domains/reservation";

import { cancelReservation } from "../api/cancel-reservation.api";

export function useCancelReservation() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: cancelReservation,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: reservationQueryKeys.all,
      }),
  });

  return {
    cancelReservation: mutation.mutateAsync,
    isCancelling: mutation.isPending,
  };
}

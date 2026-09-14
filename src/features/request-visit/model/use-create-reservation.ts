"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { reservationQueryKeys } from "@/domains/reservation";

import { createReservation } from "../api/create-reservation.api";

export function useCreateReservation() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createReservation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: reservationQueryKeys.lists() }),
  });

  return {
    createReservation: mutation.mutateAsync,
    isCreating: mutation.isPending,
  };
}

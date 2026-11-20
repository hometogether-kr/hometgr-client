"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";

import { reservationQueryKeys } from "@/domains/reservation";

import { createReservation,type CreateReservationInput } from "../api/create-reservation.api";

type ReservationSubmission = Omit<CreateReservationInput, "idempotencyKey">;

export function useCreateReservation() {
  const queryClient = useQueryClient();
  const attempt = useRef<{ signature: string; key: string } | null>(null);
  const mutation = useMutation({
    mutationFn: createReservation,
    onSuccess: () => {
      attempt.current = null;
      void queryClient.invalidateQueries({ queryKey: reservationQueryKeys.lists() });
    },
  });

  const submit = (input: ReservationSubmission) => {
    const signature = JSON.stringify([input.roomId, input.visitRequestTimes]);

    // 응답을 받지 못한 경우에도 같은 선택을 재시도하면 이전 키를 사용합니다.
    if (attempt.current?.signature !== signature) {
      attempt.current = { signature, key: crypto.randomUUID() };
    }

    return mutation.mutateAsync({ ...input, idempotencyKey: attempt.current.key });
  };

  return {
    createReservation: submit,
    isCreating: mutation.isPending,
  };
}

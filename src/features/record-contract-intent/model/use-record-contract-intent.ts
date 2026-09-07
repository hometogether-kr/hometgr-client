"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { reservationQueryKeys } from "@/domains/reservation";

import { recordContractIntent } from "../api/record-contract-intent.api";

export function useRecordContractIntent() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: recordContractIntent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: reservationQueryKeys.all }),
  });

  return {
    recordContractIntent: mutation.mutateAsync,
    isRecordingContractIntent: mutation.isPending,
  };
}

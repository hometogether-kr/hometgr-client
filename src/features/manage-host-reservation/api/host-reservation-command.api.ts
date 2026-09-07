import { z } from "zod";

import { rejectReasonDtoSchema, reservationResponseDtoSchema } from "@/domains/reservation";
import { apiRequest } from "@/shared/api";

const rejectHostReservationInputSchema = z.object({
  reservationId: z.uuid(),
  reason: rejectReasonDtoSchema,
  message: z.string().trim().min(1).max(2000).optional(),
});

export type RejectHostReservationInput = z.infer<typeof rejectHostReservationInputSchema>;

export function acceptHostReservation(reservationId: string) {
  return apiRequest({
    method: "POST",
    path: `/host/reservations/${encodeURIComponent(reservationId)}/acceptances`,
    schema: reservationResponseDtoSchema,
  });
}

export function rejectHostReservation(input: RejectHostReservationInput) {
  const { reservationId, reason, message } = rejectHostReservationInputSchema.parse(input);
  return apiRequest({
    method: "POST",
    path: `/host/reservations/${encodeURIComponent(reservationId)}/rejections`,
    body: { reason, ...(message ? { message } : {}) },
    schema: reservationResponseDtoSchema,
  });
}

import { reservationResponseDtoSchema } from "@/domains/reservation";
import { apiRequest } from "@/shared/api";

export async function cancelReservation(reservationId: string) {
  return apiRequest({
    method: "POST",
    path: `/me/reservations/${encodeURIComponent(reservationId)}/cancellations`,
    schema: reservationResponseDtoSchema,
  });
}

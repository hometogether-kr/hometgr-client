import { z } from "zod";

import { reservationResponseDtoSchema } from "@/domains/reservation";
import { apiRequest } from "@/shared/api";

const createReservationInputSchema = z.object({
  roomId: z.uuid(),
  visitRequestTimes: z
    .array(z.string().datetime({ offset: true }))
    .min(1)
    .max(3)
    .refine(
      (times) => times.every((time) => new Date(time).getTime() > Date.now()),
      "현재보다 이후 시간을 선택해주세요.",
    ),
});

export type CreateReservationInput = z.infer<typeof createReservationInputSchema>;

export async function createReservation(input: CreateReservationInput) {
  const { roomId, visitRequestTimes } = createReservationInputSchema.parse(input);
  const [visitRequestDate1, visitRequestDate2 = null, visitRequestDate3 = null] = visitRequestTimes;

  return apiRequest({
    method: "POST",
    path: `/rooms/${encodeURIComponent(roomId)}/reservations`,
    body: {
      visitRequestDate1,
      visitRequestDate2,
      visitRequestDate3,
    },
    schema: reservationResponseDtoSchema,
  });
}

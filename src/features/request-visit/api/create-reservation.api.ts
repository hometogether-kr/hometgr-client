import { z } from "zod";

import { apiRequest } from "@/shared/api";

const dateTimeSchema = z.iso.datetime({ offset: true });

const createReservationInputSchema = z.object({
  roomId: z.uuid(),
  idempotencyKey: z.uuid(),
  visitRequestTimes: z.array(dateTimeSchema).min(1).max(3),
});

const createReservationResponseSchema = z.object({
  serverNow: dateTimeSchema,
  reservation: z.object({ id: z.uuid() }),
});

export type CreateReservationInput = z.infer<typeof createReservationInputSchema>;

export async function createReservation(input: CreateReservationInput) {
  const { roomId, idempotencyKey, visitRequestTimes } = createReservationInputSchema.parse(input);
  const [visitRequestDate1, visitRequestDate2 = null, visitRequestDate3 = null] = visitRequestTimes;

  return apiRequest({
    method: "POST",
    path: `/rooms/${encodeURIComponent(roomId)}/reservations`,
    headers: { "Idempotency-Key": idempotencyKey },
    body: {
      visitRequestDate1,
      visitRequestDate2,
      visitRequestDate3,
    },
    schema: createReservationResponseSchema,
  });
}

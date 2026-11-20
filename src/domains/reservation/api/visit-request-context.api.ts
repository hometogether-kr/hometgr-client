import { z } from "zod";

import { apiRequest } from "@/shared/api";

const dateTimeSchema = z.iso.datetime({ offset: true });
const blockedSlotSchema = z
  .object({
    startsAt: dateTimeSchema,
    endsAt: dateTimeSchema,
  })
  .refine(({ startsAt, endsAt }) => Date.parse(startsAt) < Date.parse(endsAt));

const visitRequestPolicySchema = z
  .object({
    timeZone: z.literal("Asia/Seoul"),
    firstDate: z.iso.date(),
    lastDate: z.iso.date(),
    maxCandidates: z.literal(3),
    allowedLocalTimes: z.array(z.iso.time({ precision: -1 })).min(1),
    slotDurationMinutes: z.number().int().positive(),
  })
  .refine(({ firstDate, lastDate }) => firstDate <= lastDate);

const visitRequestContextSchema = z.object({
  serverNow: dateTimeSchema,
  canRequestVisit: z.boolean(),
  blockedReason: z.string().nullable(),
  blockingReservationId: z.uuid().nullable(),
  policy: visitRequestPolicySchema,
  blockedSlots: z.array(blockedSlotSchema),
});

export type VisitRequestContext = z.infer<typeof visitRequestContextSchema>;

export function fetchVisitRequestContext(roomId: string, signal?: AbortSignal) {
  return apiRequest({
    path: `/rooms/${encodeURIComponent(roomId)}/visit-request-context`,
    schema: visitRequestContextSchema,
    signal,
  });
}

import { z } from "zod";

export const reservationStatusDtoSchema = z.enum([
  "requested",
  "hostViewed",
  "accepted",
  "rejected",
  "visitScheduled",
  "visitCompleted",
  "contractPending",
  "contractSent",
  "contractSigned",
  "paymentPending",
  "paymentCompleted",
  "cancelledByStudent",
  "cancelledByHost",
  "expired",
  "completed",
  "checkoutPending",
  "checkoutCompleted",
]);

export const rejectReasonDtoSchema = z.enum([
  "alreadyInProgress",
  "moveInDateMismatch",
  "stayPeriodMismatch",
  "conditionMismatch",
  "other",
]);

const contractIntentDtoSchema = z.enum(["wantContract", "considering", "declined"]);
const nullableDateTimeSchema = z.string().datetime({ offset: true }).nullable();

/** OpenAPI: ReservationResponseDto */
export const reservationResponseDtoSchema = z.object({
  id: z.uuid(),
  roomId: z.uuid(),
  studentId: z.uuid(),
  hostId: z.uuid(),
  desiredMoveInDate: z.string().nullable(),
  desiredStayMonths: z.number().int().min(1).max(120).nullable(),
  visitRequestDate1: nullableDateTimeSchema,
  visitRequestDate2: nullableDateTimeSchema,
  visitRequestDate3: nullableDateTimeSchema,
  studentMessage: z.string().nullable(),
  studentIntroSnapshot: z.string().nullable(),
  reservationStatus: reservationStatusDtoSchema,
  hostResponseAt: nullableDateTimeSchema,
  visitScheduledAt: nullableDateTimeSchema,
  visitReminderSentAt: nullableDateTimeSchema,
  visitCompletedAt: nullableDateTimeSchema,
  rejectReason: rejectReasonDtoSchema.nullable(),
  rejectMessage: z.string().nullable(),
  checkoutData: z.record(z.string(), z.unknown()).nullable(),
  checkoutConfirmedAt: nullableDateTimeSchema,
  contractIntent: contractIntentDtoSchema.nullable(),
  contractIntentRequestedAt: nullableDateTimeSchema,
  expiresAt: z.string().datetime({ offset: true }),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

export type ReservationResponseDto = z.infer<typeof reservationResponseDtoSchema>;

/** OpenAPI: RoomListItemDto. 예약 화면에서 실제로 쓰는 공개 필드만 검증합니다. */
const reservationRoomDtoSchema = z.object({
  id: z.uuid(),
  title: z.string().nullish(),
  propertyType: z.string().nullish(),
  roomType: z.string().nullish(),
  buildingType: z.string().nullish(),
  rentalSpaceType: z.string().nullish(),
  addressRegion: z.string().nullish(),
  approximateLocation: z.string().nullish(),
  depositKrw: z.number().int().nullable(),
  monthlyRentKrw: z.number().int().nullable(),
  maintenanceFeeKrw: z.number().int().nullable(),
  availableFrom: z.string().nullish(),
  availabilityStatus: z.string().nullish(),
  roomStatus: z.string(),
  createdAt: z.string().datetime({ offset: true }),
});

/** OpenAPI: StudentReservationResponseDto */
export const studentReservationResponseDtoSchema = reservationResponseDtoSchema.extend({
  room: reservationRoomDtoSchema,
});

export type StudentReservationResponseDto = z.infer<typeof studentReservationResponseDtoSchema>;

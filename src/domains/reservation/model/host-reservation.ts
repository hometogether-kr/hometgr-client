import { z } from "zod";

import type { ReservationResponseDto } from "../api/reservation.dto";

export const hostReservationSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  studentName: z.string(),
  introduction: z.string(),
  studentMessage: z.string(),
  requestedVisitTimes: z.array(z.string()),
  status: z.enum(["pending", "confirmed", "suggested", "rejected", "cancelled"]),
  scheduledTime: z.string().nullable(),
  reason: z.string().default(""),
  suggestion: z.string().default(""),
});
export type HostReservation = z.infer<typeof hostReservationSchema>;

// 집주인 예약 목록 API가 생기기 전까지 목록 디자인에만 사용하는 예시 데이터입니다.
export const hostReservationFixtures: HostReservation[] = [1, 2, 3, 4].map((number) => ({
  id: `host-demo-${number}`,
  roomId: "host-demo-room",
  studentName: "김민수",
  introduction: "조용하고 깨끗하게 지내는 편입니다. 잘 부탁드립니다.",
  studentMessage:
    "안녕하세요! 이번 방문을 통해 어르신과 함께 가벼운 산책을 하고, 스마트폰 사용법을 알려드리고 싶습니다.",
  requestedVisitTimes: ["2026-09-25T14:00:00+09:00", "2026-09-27T12:00:00+09:00"],
  status: number === 4 ? "confirmed" : "pending",
  scheduledTime: number === 4 ? "2026-09-25T14:00" : null,
  reason: "",
  suggestion: "",
}));

function toHostStatus(
  status: ReservationResponseDto["reservationStatus"],
): HostReservation["status"] {
  if (status === "requested" || status === "hostViewed") return "pending";
  if (status === "rejected") return "rejected";
  if (status === "cancelledByHost" || status === "cancelledByStudent" || status === "expired") {
    return "cancelled";
  }
  return "confirmed";
}

export function toHostReservation(dto: ReservationResponseDto): HostReservation {
  return hostReservationSchema.parse({
    id: dto.id,
    roomId: dto.roomId,
    studentName: "입주자",
    introduction: dto.studentIntroSnapshot ?? "등록된 자기소개가 없습니다.",
    studentMessage: dto.studentMessage ?? "전달된 요청 사항이 없습니다.",
    requestedVisitTimes: [
      dto.visitRequestDate1,
      dto.visitRequestDate2,
      dto.visitRequestDate3,
    ].filter((value): value is string => value !== null),
    status: toHostStatus(dto.reservationStatus),
    scheduledTime: dto.visitScheduledAt,
    reason: dto.rejectMessage ?? dto.rejectReason ?? "",
    suggestion: "",
  });
}

export function formatHostVisitTime(value: string | null) {
  if (!value) return "미정";
  const date = new Date(value);
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function formatHostVisitChoice(value: string) {
  const date = new Date(value);
  return {
    label: new Intl.DateTimeFormat("ko-KR", {
      timeZone: "Asia/Seoul",
      month: "long",
      day: "numeric",
      weekday: "long",
    }).format(date),
    time: new Intl.DateTimeFormat("ko-KR", {
      timeZone: "Asia/Seoul",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date),
  };
}

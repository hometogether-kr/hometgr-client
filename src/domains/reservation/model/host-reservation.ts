import { z } from "zod";

export const hostReservationSchema = z.object({
  id: z.string(),
  studentName: z.string(),
  introduction: z.string(),
  status: z.enum(["pending", "confirmed", "suggested", "rejected", "cancelled"]),
  scheduledTime: z.string().nullable(),
  reason: z.string().default(""),
  suggestion: z.string().default(""),
});
export type HostReservation = z.infer<typeof hostReservationSchema>;

// Isolated preview data until host reservation endpoints are available.
export const hostReservationFixtures: HostReservation[] = [1, 2, 3, 4].map((number) => ({
  id: `host-demo-${number}`,
  studentName: "김민수",
  introduction: "조용하고 깨끗하게 지내는 편입니다. 잘 부탁드립니다.",
  status: number === 4 ? "confirmed" : "pending",
  scheduledTime: number === 4 ? "2026-09-25T14:00" : null,
  reason: "",
  suggestion: "",
}));

export const hostVisitSlots = [
  { value: "2026-09-25T14:00", label: "9월 25일 금요일", time: "오후 2:00", closed: false },
  { value: "2026-09-27T12:00", label: "9월 27일 일요일", time: "오후 12:00", closed: false },
  { value: "2026-09-23T14:00", label: "9월 23일 수요일", time: "오후 2:00", closed: true },
];

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

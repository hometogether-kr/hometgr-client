import { z } from "zod";

export const moveInTimingSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
  period: z.enum(["early", "mid", "late"]),
});

export type MoveInTiming = z.infer<typeof moveInTimingSchema>;

export function formatMoveInTiming(timing: MoveInTiming | null) {
  if (!timing) return "미입력";
  const periods = { early: "초", mid: "중순", late: "말" };
  return `${timing.year}년 ${timing.month}월 ${periods[timing.period]}`;
}

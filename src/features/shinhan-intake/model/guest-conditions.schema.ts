import { z } from "zod";

import { getShinhanTodayDate, parseShinhanCalendarDate } from "./guest-date";

export const shinhanGuestRegionSchema = z
  .string()
  .trim()
  .min(1, "희망 위치를 입력해 주세요.")
  .max(200, "희망 위치는 200자 이내로 입력해 주세요.");

const guestBudgetAmountSchema = z
  .number({ error: "월세 예산을 선택해 주세요." })
  .int("월세 예산은 1만 원 단위로 선택해 주세요.")
  .min(200000, "월세 예산은 20만 원 이상으로 선택해 주세요.")
  .max(1000000, "월세 예산은 100만 원 이하로 선택해 주세요.")
  .multipleOf(10000, "월세 예산은 1만 원 단위로 선택해 주세요.")
  .nullable()
  .refine((value) => value !== null, "월세 예산을 선택해 주세요.");

const guestMoveInDateSchema = z.string().superRefine((value, context) => {
  if (!value) {
    context.addIssue({ code: "custom", message: "입주일을 선택해 주세요." });
    return;
  }
  if (!parseShinhanCalendarDate(value)) {
    context.addIssue({ code: "custom", message: "올바른 입주일을 선택해 주세요." });
    return;
  }
  if (value < getShinhanTodayDate()) {
    context.addIssue({ code: "custom", message: "입주일은 오늘 이후 날짜로 선택해 주세요." });
  }
});

export const shinhanGuestBudgetSchema = z
  .object({
    budgetMonthlyKrw: guestBudgetAmountSchema,
    desiredRegionRaw: shinhanGuestRegionSchema,
    moveInTiming: z.enum(["ASAP", "WITHIN_MONTH", "DATE"]).optional(),
    moveInDate: z.string(),
  })
  .superRefine((values, context) => {
    if (values.moveInTiming === "ASAP" || values.moveInTiming === "WITHIN_MONTH") return;
    const parsed = guestMoveInDateSchema.safeParse(values.moveInDate);
    if (!parsed.success)
      for (const issue of parsed.error.issues)
        context.addIssue({ code: "custom", path: ["moveInDate"], message: issue.message });
  });

export const shinhanGuestDemandSchema = z
  .object({
    desiredRegionRaw: shinhanGuestRegionSchema,
    budgetMinKrw: guestBudgetAmountSchema,
    budgetMaxKrw: guestBudgetAmountSchema,
    moveInDate: guestMoveInDateSchema,
    contractTermCode: z.enum(
      [
        "MONTH_1",
        "MONTH_2",
        "MONTH_3",
        "MONTH_4",
        "MONTH_5",
        "MONTH_6",
        "MONTH_7",
        "MONTH_8",
        "MONTH_9",
        "MONTH_10",
        "MONTH_11",
        "MONTH_12",
        "MONTHS_12_PLUS",
      ],
      { error: "계약기간을 선택해 주세요." },
    ),
    gender: z
      .enum(["FEMALE", "MALE"], { error: "성별을 선택해 주세요." })
      .nullable()
      .refine((value) => value !== null, "성별을 선택해 주세요."),
  })
  .superRefine((values, context) => {
    if (
      values.budgetMinKrw !== null &&
      values.budgetMaxKrw !== null &&
      values.budgetMinKrw > values.budgetMaxKrw
    ) {
      context.addIssue({
        code: "custom",
        path: ["budgetMaxKrw"],
        message: "최대 월세는 최소 월세 이상으로 선택해 주세요.",
      });
    }
  });

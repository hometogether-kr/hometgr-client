import { z } from "zod";

import {
  formatShinhanCalendarDate,
  getShinhanTodayDate,
  parseShinhanCalendarDate,
} from "../model/guest-date";
import type { ShinhanGuestBudgetValues, ShinhanIntakeDraft } from "../model/intake-draft";
import {
  type ShinhanCreateApplicationInput,
  shinhanCreateApplicationInputSchema,
} from "./application-input.schema";

// The current API accepts a single date. Keep the user's timing choice in form state;
// adapt only at this boundary until the server supports a timing window explicitly.
function toLegacyMoveInDate(values: ShinhanGuestBudgetValues): string {
  if (values.moveInTiming === "ASAP") return getShinhanTodayDate();
  if (values.moveInTiming === "WITHIN_MONTH") {
    const date = parseShinhanCalendarDate(getShinhanTodayDate());
    if (!date) throw new Error("Current date is unavailable.");
    date.setDate(date.getDate() + 30);
    return formatShinhanCalendarDate(date);
  }
  return values.moveInDate;
}

function normalizeDraftInput(draft: ShinhanIntakeDraft): unknown {
  switch (draft.applicationType) {
    case "HOST_REGISTRATION":
      return { ownership: draft.values.ownership, areaRaw: draft.values.areaRaw.trim() };
    case "HOST_ESTIMATE": {
      const address = draft.values.address;
      return {
        address:
          address === null
            ? null
            : {
                addressSource: address.addressSource,
                addressRaw: address.addressRaw.trim(),
                sido: address.sido.trim(),
                sigungu: address.sigungu.trim(),
              },
        buildingDong: draft.values.buildingDong.trim() || null,
        unitHo: draft.values.unitHo.trim() || null,
        furniture: { ...draft.values.furniture },
        bathroomCount: draft.values.bathroomCount,
      };
    }
    case "GUEST_BUDGET":
      return {
        budgetMonthlyKrw: draft.values.budgetMonthlyKrw,
        desiredRegionRaw: draft.values.desiredRegionRaw.trim(),
        moveInDate: toLegacyMoveInDate(draft.values),
      };
    case "GUEST_DEMAND":
      return {
        desiredRegionRaw: draft.values.desiredRegionRaw.trim(),
        budgetMinKrw: draft.values.budgetMinKrw,
        budgetMaxKrw: draft.values.budgetMaxKrw,
        moveInDate: draft.values.moveInDate,
        contractTermCode: draft.values.contractTermCode,
        gender: draft.values.gender,
      };
  }
}

const newApplicationInputSchema = shinhanCreateApplicationInputSchema.superRefine(
  (value, context) => {
    if (value.applicationType !== "GUEST_BUDGET" && value.applicationType !== "GUEST_DEMAND")
      return;
    if (value.input.moveInDate >= getShinhanTodayDate()) return;
    context.addIssue({
      code: "custom",
      path: ["input", "moveInDate"],
      message: "입주일은 오늘 이후 날짜로 선택해 주세요.",
    });
  },
);

/** Prepare once per user action; retain this snapshot and its UUID for every retry. */
export function prepareShinhanApplicationInput(
  draft: ShinhanIntakeDraft,
  requiredVersion: string,
): ShinhanCreateApplicationInput {
  const normalized = {
    applicationType: draft.applicationType,
    phone: draft.phone.replace(/[ -]/g, ""),
    requiredConsent: { agreed: draft.requiredConsent, version: requiredVersion },
    input: normalizeDraftInput(draft),
  };
  return newApplicationInputSchema.parse(normalized);
}

export function getShinhanInputFieldErrors(error: unknown): Record<string, string[]> {
  if (!(error instanceof z.ZodError)) return {};
  const messages: Record<string, string> = {
    phone: "휴대폰 번호를 확인해 주세요.",
    "requiredConsent.agreed": "필수 개인정보 수집·이용에 동의해 주세요.",
    "requiredConsent.version": "서버 개인정보 전문을 다시 준비해 주세요.",
    "input.ownership": "자가 또는 월세·전세를 선택해 주세요.",
    "input.areaRaw": "집 위치를 200자 이내로 입력해 주세요.",
    "input.address": "카카오 주소검색에서 주소를 선택해 주세요.",
    "input.bathroomCount": "화장실 개수를 선택해 주세요.",
    "input.budgetMonthlyKrw": "월 예산을 20~100만 원 사이의 1만 원 단위로 선택해 주세요.",
    "input.budgetMinKrw": "최소 월세를 20~100만 원 사이의 1만 원 단위로 선택해 주세요.",
    "input.budgetMaxKrw": "최대 월세를 최소 월세 이상, 100만 원 이하로 선택해 주세요.",
    "input.desiredRegionRaw": "희망 위치를 200자 이내로 입력해 주세요.",
    "input.moveInDate": "입주일은 오늘 이후의 올바른 날짜로 선택해 주세요.",
    "input.contractTermCode": "계약기간을 선택해 주세요.",
    "input.gender": "성별을 선택해 주세요.",
  };
  const errors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path.map(String).join(".");
    (errors[path] ??= []).push(messages[path] ?? "입력 항목을 확인해 주세요.");
  }
  return errors;
}

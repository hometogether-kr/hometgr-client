import { shinhanContactSchema } from "./contact.schema";
import { type GuestConcernCode, guestConcernResponseSchema } from "./guest-concerns.schema";
import { shinhanGuestBudgetSchema, shinhanGuestDemandSchema } from "./guest-conditions.schema";
import type {
  ShinhanGuestBudgetValues,
  ShinhanGuestDemandValues,
  ShinhanIntakeDraft,
} from "./intake-draft";

export type GuestFollowupStep = "concerns" | "guide" | "notice" | "receipt" | "spaces";

interface GuestBudgetExampleApplication {
  readonly applicationType: "GUEST_BUDGET";
  readonly phone: string;
  readonly values: Readonly<ShinhanGuestBudgetValues>;
}

interface GuestDemandExampleApplication {
  readonly applicationType: "GUEST_DEMAND";
  readonly phone: string;
  readonly values: Readonly<ShinhanGuestDemandValues>;
}

interface GuestConcernNotSubmitted {
  state: "NOT_SUBMITTED";
  codes: GuestConcernCode[];
}

interface GuestConcernSubmitted {
  state: "SUBMITTED";
  codes: GuestConcernCode[];
}

// 실제 접수 결과와 혼동하지 않도록 식별자·접수 시각·알림 상태를 만들지 않는다.
export interface GuestFollowupExample {
  readonly source: "development-example";
  readonly application: GuestBudgetExampleApplication | GuestDemandExampleApplication;
  step: GuestFollowupStep;
  selectedCodes: GuestConcernCode[];
  optionalConsent: boolean | null;
  response: GuestConcernNotSubmitted | GuestConcernSubmitted;
  guideMode: "selected" | "all";
}

export function createGuestFollowupExample(
  draft: ShinhanIntakeDraft | null,
): GuestFollowupExample | null {
  if (process.env.NODE_ENV !== "development" || !draft) return null;
  if (!shinhanContactSchema.safeParse(draft).success) return null;

  let application: GuestFollowupExample["application"];

  switch (draft.applicationType) {
    case "GUEST_BUDGET":
      if (!shinhanGuestBudgetSchema.safeParse(draft.values).success) return null;
      application = {
        applicationType: draft.applicationType,
        phone: draft.phone,
        values: { ...draft.values },
      };
      break;
    case "GUEST_DEMAND":
      if (!shinhanGuestDemandSchema.safeParse(draft.values).success) return null;
      application = {
        applicationType: draft.applicationType,
        phone: draft.phone,
        values: { ...draft.values },
      };
      break;
    default:
      return null;
  }

  return {
    source: "development-example",
    application,
    step: "concerns",
    selectedCodes: [],
    optionalConsent: null,
    response: { state: "NOT_SUBMITTED", codes: [] },
    guideMode: "selected",
  };
}

export function showAllGuide(example: GuestFollowupExample): GuestFollowupExample {
  return { ...example, step: "guide", guideMode: "all" };
}

export function confirmGuestConcerns(example: GuestFollowupExample): GuestFollowupExample | null {
  const result = guestConcernResponseSchema.safeParse({
    codes: example.selectedCodes,
    optionalConsent: example.optionalConsent,
  });
  if (!result.success) return null;

  return {
    ...example,
    step: "guide",
    guideMode: "selected",
    response: { state: "SUBMITTED", codes: result.data.codes },
  };
}

// API DTO와 분리한 작성 중 UI 상태로, 미입력 값과 부분 입력을 그대로 보존한다.
export const SHINHAN_APPLICATION_TYPES = [
  "HOST_ESTIMATE",
  "HOST_REGISTRATION",
  "GUEST_BUDGET",
  "GUEST_DEMAND",
] as const;

export type ShinhanApplicationType = (typeof SHINHAN_APPLICATION_TYPES)[number];

export const SHINHAN_APPLICATION_LABELS: Record<ShinhanApplicationType, string> = {
  HOST_ESTIMATE: "호스트 방 견적",
  HOST_REGISTRATION: "호스트 방 등록",
  GUEST_BUDGET: "게스트 예산 매칭",
  GUEST_DEMAND: "게스트 위치·예산 수요조사",
};

export type ShinhanDraftStep = "conditions" | "contact";

export interface ShinhanEstimateAddress {
  addressSource: "KAKAO_POSTCODE";
  addressRaw: string;
  sido: string;
  sigungu: string;
}

export type ShinhanFurnitureState = "OWNED" | "PLANNED" | "NONE" | null;

export interface ShinhanHostEstimateValues {
  address: ShinhanEstimateAddress | null;
  buildingDong: string;
  unitHo: string;
  furniture: {
    bed: ShinhanFurnitureState;
    desk: ShinhanFurnitureState;
    chair: ShinhanFurnitureState;
    wardrobe: ShinhanFurnitureState;
  };
  bathroomCount: 1 | 2 | null;
}

export interface ShinhanHostRegistrationValues {
  ownership: "OWNED" | "RENTED" | null;
  areaRaw: string;
}

export interface ShinhanGuestBudgetValues {
  budgetMonthlyKrw: number | null;
  desiredRegionRaw: string;
  moveInDate: string;
}

export interface ShinhanGuestDemandValues {
  desiredRegionRaw: string;
  budgetMinKrw: number | null;
  budgetMaxKrw: number | null;
  moveInDate: string;
  contractTermCode: string;
  gender: "FEMALE" | "MALE" | null;
}

interface ShinhanDraftBase {
  step: ShinhanDraftStep;
  phone: string;
  requiredConsent: boolean;
  optionalConsent: boolean | null;
  concernCodes: string[];
}

export interface ShinhanHostEstimateDraft extends ShinhanDraftBase {
  applicationType: "HOST_ESTIMATE";
  values: ShinhanHostEstimateValues;
}

export interface ShinhanHostRegistrationDraft extends ShinhanDraftBase {
  applicationType: "HOST_REGISTRATION";
  values: ShinhanHostRegistrationValues;
}

export interface ShinhanGuestBudgetDraft extends ShinhanDraftBase {
  applicationType: "GUEST_BUDGET";
  values: ShinhanGuestBudgetValues;
}

export interface ShinhanGuestDemandDraft extends ShinhanDraftBase {
  applicationType: "GUEST_DEMAND";
  values: ShinhanGuestDemandValues;
}

export type ShinhanIntakeDraft =
  | ShinhanHostEstimateDraft
  | ShinhanHostRegistrationDraft
  | ShinhanGuestBudgetDraft
  | ShinhanGuestDemandDraft;

export function createShinhanDraft(applicationType: ShinhanApplicationType): ShinhanIntakeDraft {
  const base: ShinhanDraftBase = {
    step: "conditions",
    phone: "",
    requiredConsent: false,
    optionalConsent: null,
    concernCodes: [],
  };

  switch (applicationType) {
    case "HOST_ESTIMATE":
      return {
        ...base,
        applicationType,
        values: {
          address: null,
          buildingDong: "",
          unitHo: "",
          furniture: { bed: null, desk: null, chair: null, wardrobe: null },
          bathroomCount: null,
        },
      };
    case "HOST_REGISTRATION":
      return {
        ...base,
        applicationType,
        values: { ownership: null, areaRaw: "" },
      };
    case "GUEST_BUDGET":
      return {
        ...base,
        applicationType,
        values: { budgetMonthlyKrw: null, desiredRegionRaw: "", moveInDate: "" },
      };
    case "GUEST_DEMAND":
      return {
        ...base,
        applicationType,
        values: {
          desiredRegionRaw: "",
          budgetMinKrw: null,
          budgetMaxKrw: null,
          moveInDate: "",
          contractTermCode: "",
          gender: null,
        },
      };
  }
}

import { shinhanContactSchema } from "./contact.schema";
import { type HostConcernCode, hostConcernResponseSchema } from "./host-concerns.schema";
import { shinhanHostEstimateSchema } from "./host-estimate.schema";
import type { ShinhanHostEstimateValues, ShinhanIntakeDraft } from "./intake-draft";

export type HostFollowupStep = "result" | "concerns" | "introduction";

interface HostEstimateSnapshotValues {
  readonly address: Readonly<NonNullable<ShinhanHostEstimateValues["address"]>> | null;
  readonly buildingDong: string;
  readonly unitHo: string;
  readonly furniture: Readonly<ShinhanHostEstimateValues["furniture"]>;
  readonly bathroomCount: ShinhanHostEstimateValues["bathroomCount"];
}

interface HostEstimateExampleApplication {
  readonly applicationType: "HOST_ESTIMATE";
  readonly phone: string;
  readonly values: HostEstimateSnapshotValues;
}

interface EstimateRange {
  readonly min: number;
  readonly max: number;
}

interface HostEstimateExample {
  readonly rulesVersion: string;
  readonly region: {
    readonly source: "district" | "seoul_config_average";
    readonly districtUsed: string | null;
    readonly fallbackReason: "outside_seoul_or_unsupported" | "district_unresolved" | null;
    readonly baseMonthlyWon: EstimateRange;
  };
  readonly adjustmentWon: number;
  readonly rawMonthlyWon: EstimateRange;
  readonly monthlyWon: EstimateRange;
  readonly annualWon: EstimateRange;
  readonly plannedFurnitureKeys: readonly string[];
}

interface HostConcernResponse {
  state: "NOT_SUBMITTED" | "SUBMITTED";
  codes: HostConcernCode[];
}

// 고정 계약 예시와 사용자의 작성 조건을 분리한다. 실제 신청 식별자·시각·알림 상태는 만들지 않는다.
export interface HostFollowupExample {
  readonly source: "development-example";
  readonly application: HostEstimateExampleApplication;
  readonly estimateInput: HostEstimateSnapshotValues;
  readonly estimate: HostEstimateExample;
  step: HostFollowupStep;
  selectedCodes: HostConcernCode[];
  response: HostConcernResponse;
}

function createEstimateInputExample(): HostEstimateSnapshotValues {
  return {
    address: {
      addressSource: "KAKAO_POSTCODE",
      addressRaw: "서울특별시 노원구 동일로 1234",
      sido: "서울특별시",
      sigungu: "노원구",
    },
    buildingDong: "",
    unitHo: "",
    furniture: { bed: "OWNED", desk: "PLANNED", chair: "NONE", wardrobe: "OWNED" },
    bathroomCount: 2,
  };
}

// 신한 API 계약 1.0.0의 노원구 예시 응답이다. 작성 조건으로 프론트에서 계산하지 않는다.
function createEstimateExample(): HostEstimateExample {
  return {
    rulesVersion: "hometogether-rent-seoul-v1.0.0",
    region: {
      source: "district",
      districtUsed: "노원구",
      fallbackReason: null,
      baseMonthlyWon: { min: 350000, max: 450000 },
    },
    adjustmentWon: 75000,
    rawMonthlyWon: { min: 425000, max: 525000 },
    monthlyWon: { min: 425000, max: 525000 },
    annualWon: { min: 5100000, max: 6300000 },
    plannedFurnitureKeys: ["desk"],
  };
}

export function createHostFollowupExample(
  draft: ShinhanIntakeDraft | null,
): HostFollowupExample | null {
  if (process.env.NODE_ENV !== "development" || draft?.applicationType !== "HOST_ESTIMATE") {
    return null;
  }
  if (!shinhanContactSchema.safeParse(draft).success) return null;
  if (!shinhanHostEstimateSchema.safeParse(draft.values).success) return null;

  return {
    source: "development-example",
    application: {
      applicationType: draft.applicationType,
      phone: draft.phone,
      values: {
        ...draft.values,
        address: draft.values.address ? { ...draft.values.address } : null,
        furniture: { ...draft.values.furniture },
      },
    },
    estimateInput: createEstimateInputExample(),
    estimate: createEstimateExample(),
    step: "result",
    selectedCodes: [],
    response: { state: "NOT_SUBMITTED", codes: [] },
  };
}

export function confirmHostConcerns(example: HostFollowupExample): HostFollowupExample | null {
  const result = hostConcernResponseSchema.safeParse({
    codes: example.selectedCodes,
  });
  if (!result.success) return null;

  return {
    ...example,
    step: "introduction",
    response: { state: "SUBMITTED", codes: result.data.codes },
  };
}

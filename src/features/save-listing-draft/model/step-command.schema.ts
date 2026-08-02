import { z } from "zod";
import {
  AREA_RANGES,
  BATHROOM_USAGE_TYPES,
  BUILDING_TYPES,
  INTERACTION_PREFERENCES,
  KITCHEN_USAGE_POLICIES,
  LIVING_ROOM_USAGE_POLICIES,
  PREFERRED_CONTACT_METHODS,
  PREFERRED_CONTACT_TIMES,
  PREFERRED_GENDERS,
  PRIVATE_ROOM_OPTIONS_VALUES,
  PRIVATE_ROOM_SIZES,
  REGISTRANT_RELATIONSHIPS,
  RENTAL_SPACE_TYPES,
  RESIDENT_GENDER_COMPOSITIONS,
  RESIDENT_TYPES,
  ROOM_CAPACITIES,
  SMOKING_PREFERENCES,
  VISITOR_POLICIES,
  WASHING_MACHINE_USAGE_POLICIES,
} from "@/domains/listing-draft";

const MAX_INT32 = 2_147_483_647;

/** 낙관적 잠금 version — 모든 저장 요청에 함께 보냅니다. */
export const expectedVersionSchema = z.number().int().min(1).max(MAX_INT32);

/*
 * 조건부 필드는 "해당 조건일 때만 키 자체를 보낸다"가 API 규칙입니다.
 * null을 보내면 검증에 걸리므로 `.optional()`로 두고 superRefine으로 존재 여부를 확인합니다.
 */

export const step2DataSchema = z.object({
  registrantRelationship: z.enum(REGISTRANT_RELATIONSHIPS),
});

/*
 * 주소는 화면 규칙을 따릅니다.
 *
 * API는 도로명·상세·지역을 모두 required로 두지만, 화면은 "정확한 주소를 몰라도
 * 대략적인 위치만으로 진행"할 수 있게 설계돼 있습니다. 화면 기준으로 확정했으므로
 * 세 필드를 optional로 두고, 둘 중 한 가지 방식만 채우면 통과시킵니다.
 * 백엔드가 required를 풀기 전까지 이 요청은 400으로 거절됩니다(README 3번 항목).
 */
export const step3DataSchema = z
  .object({
    addressRoad: z.string().min(1).max(255).optional(),
    addressDetail: z.string().min(1).max(255).optional(),
    addressRegion: z.string().min(1).max(255).optional(),
    buildingType: z.enum(BUILDING_TYPES),
    buildingTypeOther: z.string().min(1).max(100).optional(),
    approximateLocation: z.string().min(1).max(255).optional(),
  })
  .superRefine((value, ctx) => {
    const hasExactAddress = Boolean(value.addressRoad && value.addressDetail);

    if (!hasExactAddress && !value.approximateLocation) {
      ctx.addIssue({
        code: "custom",
        path: ["approximateLocation"],
        message: "주소 검색과 상세 주소를 입력하거나, 대략적인 위치를 입력해주세요.",
      });
    }

    const needsOther = value.buildingType === "other";

    if (needsOther && !value.buildingTypeOther) {
      ctx.addIssue({
        code: "custom",
        path: ["buildingTypeOther"],
        message: "기타 건물 유형을 입력해주세요.",
      });
    }
    if (!needsOther && value.buildingTypeOther !== undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["buildingTypeOther"],
        message: "건물 유형이 기타가 아닐 때는 보낼 수 없습니다.",
      });
    }
  });

export const step4DataSchema = z
  .object({
    areaRange: z.enum(AREA_RANGES),
    totalRoomCount: z.number().int().min(1).max(100),
    residentCount: z.number().int().min(1).max(100),
    residentType: z.enum(RESIDENT_TYPES),
    residentGenderComposition: z.enum(RESIDENT_GENDER_COMPOSITIONS),
    elevatorAvailable: z.boolean(),
    parkingAvailable: z.boolean(),
    parkingDescription: z.string().min(1).max(500).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.parkingAvailable && !value.parkingDescription) {
      ctx.addIssue({
        code: "custom",
        path: ["parkingDescription"],
        message: "주차 방식을 선택해주세요.",
      });
    }
    if (!value.parkingAvailable && value.parkingDescription !== undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["parkingDescription"],
        message: "주차가 불가능할 때는 보낼 수 없습니다.",
      });
    }
  });

export const step5DataSchema = z
  .object({
    rentalSpaceType: z.enum(RENTAL_SPACE_TYPES),
    rentalSpaceTypeOther: z.string().min(1).max(100).optional(),
    privateRoomSize: z.enum(PRIVATE_ROOM_SIZES),
    privateRoomOptions: z.array(z.enum(PRIVATE_ROOM_OPTIONS_VALUES)).min(1).max(10),
  })
  .superRefine((value, ctx) => {
    const needsOther = value.rentalSpaceType === "other";

    if (needsOther && !value.rentalSpaceTypeOther) {
      ctx.addIssue({
        code: "custom",
        path: ["rentalSpaceTypeOther"],
        message: "사용할 공간을 입력해주세요.",
      });
    }
    if (!needsOther && value.rentalSpaceTypeOther !== undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["rentalSpaceTypeOther"],
        message: "공간 유형이 기타가 아닐 때는 보낼 수 없습니다.",
      });
    }

    const options = new Set(value.privateRoomOptions);
    if (options.size !== value.privateRoomOptions.length) {
      ctx.addIssue({ code: "custom", path: ["privateRoomOptions"], message: "옵션이 중복됩니다." });
    }
    // "없음"은 다른 옵션과 함께 보낼 수 없습니다 (OpenAPI 3.0으로 표현되지 않은 규칙).
    if (options.has("none") && options.size > 1) {
      ctx.addIssue({
        code: "custom",
        path: ["privateRoomOptions"],
        message: "'없음'은 다른 옵션과 함께 선택할 수 없습니다.",
      });
    }
  });

export const step6DataSchema = z.object({
  kitchenUsagePolicy: z.enum(KITCHEN_USAGE_POLICIES),
  livingRoomUsagePolicy: z.enum(LIVING_ROOM_USAGE_POLICIES),
  washingMachineUsagePolicy: z.enum(WASHING_MACHINE_USAGE_POLICIES),
  bathroomUsageType: z.enum(BATHROOM_USAGE_TYPES),
  bathroomDescription: z.string().min(1).max(500).nullable().optional(),
});

export const step7DataSchema = z.object({
  visitorPolicy: z.enum(VISITOR_POLICIES),
  petAllowed: z.boolean(),
  smokingPreference: z.enum(SMOKING_PREFERENCES),
  preferredGender: z.enum(PREFERRED_GENDERS),
  roomCapacity: z.enum(ROOM_CAPACITIES),
  interactionPreference: z.enum(INTERACTION_PREFERENCES),
  additionalGuidance: z.string().min(1).max(2000).nullable().optional(),
});

export const step8DataSchema = z.object({
  monthlyRentKrw: z.number().int().min(1).max(100_000_000),
  depositKrw: z.number().int().min(0).max(1_000_000_000),
  maintenanceFeeKrw: z.number().int().min(0).max(1_000_000_000),
  /** 시간대 suffix가 반드시 포함된 ISO 시각 */
  moveInAvailableAt: z.string().regex(/[+-]\d{2}:\d{2}$|Z$/, "시간대가 포함되어야 합니다."),
  minStayMonths: z.number().int().min(1).max(120),
});

/*
 * 사진 장수도 화면 규칙(6~20장)을 따릅니다. API는 1~10장으로 제한하고 있어,
 * 백엔드가 상한을 20으로 올리기 전까지 10장을 넘기면 거절됩니다(README 2번 항목).
 */
export const MIN_LISTING_PHOTOS = 6;
export const MAX_LISTING_PHOTOS = 20;

export const step9DataSchema = z
  .object({
    mediaIds: z.array(z.uuid()).min(MIN_LISTING_PHOTOS).max(MAX_LISTING_PHOTOS),
    representativeMediaId: z.uuid(),
  })
  .superRefine((value, ctx) => {
    if (!value.mediaIds.includes(value.representativeMediaId)) {
      ctx.addIssue({
        code: "custom",
        path: ["representativeMediaId"],
        message: "대표 사진은 업로드한 사진 중에서 선택해야 합니다.",
      });
    }
  });

export const step10DataSchema = z.object({
  roomDescription: z.string().min(1).max(2000).nullable().optional(),
  currentResidentsDescription: z.string().min(1).max(2000).nullable().optional(),
  precautions: z.string().min(1).max(2000).nullable().optional(),
});

export const step11DataSchema = z.object({
  contactName: z.string().min(1).max(100),
  /** E.164 13자 고정 (`+821012345678`) */
  contactPhone: z.string().length(13),
  preferredContactTime: z.enum(PREFERRED_CONTACT_TIMES),
  preferredContactMethod: z.enum(PREFERRED_CONTACT_METHODS),
});

/** 화면 단계별 데이터 스키마 — key는 API 단계 번호입니다. */
export const STEP_DATA_SCHEMA = {
  2: step2DataSchema,
  3: step3DataSchema,
  4: step4DataSchema,
  5: step5DataSchema,
  6: step6DataSchema,
  7: step7DataSchema,
  8: step8DataSchema,
  9: step9DataSchema,
  10: step10DataSchema,
  11: step11DataSchema,
} as const;

export type StepDataMap = {
  [Step in keyof typeof STEP_DATA_SCHEMA]: z.infer<(typeof STEP_DATA_SCHEMA)[Step]>;
};

export type SaveStepCommand = {
  [Step in keyof StepDataMap]: {
    step: Step;
    expectedVersion: number;
    data: StepDataMap[Step];
  };
}[keyof StepDataMap];

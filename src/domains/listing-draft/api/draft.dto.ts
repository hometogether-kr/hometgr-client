import { z } from "zod";

import {
  AREA_RANGES,
  BATHROOM_USAGE_TYPES,
  BUILDING_TYPES,
  INTERACTION_PREFERENCES,
  KITCHEN_USAGE_POLICIES,
  LIVING_ROOM_USAGE_POLICIES,
  PARKING_TYPES,
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
} from "../model/listing-options";
import { API_STEPS } from "../model/listing-step";

/* 단계별 저장 데이터 (OpenAPI: Draft*DataResponse) */

export const draftRegistrantDataSchema = z.object({
  registrantRelationship: z.enum(REGISTRANT_RELATIONSHIPS),
});

/**
 * 정확 주소 3종은 대략적 위치만으로 저장한 초안에서 비어 있습니다.
 * 서버가 세 필드를 nullable로 내려주므로 화면도 없는 상태를 정상으로 다룹니다.
 */
export const draftLocationDataSchema = z.object({
  addressRoad: z.string().nullish(),
  addressDetail: z.string().nullish(),
  addressRegion: z.string().nullish(),
  buildingType: z.enum(BUILDING_TYPES),
  buildingTypeOther: z.string().nullish(),
  approximateLocation: z.string().nullish(),
});

export const draftHouseholdDataSchema = z.object({
  areaRange: z.enum(AREA_RANGES),
  totalRoomCount: z.number().int(),
  residentCount: z.number().int(),
  residentType: z.enum(RESIDENT_TYPES),
  residentGenderComposition: z.enum(RESIDENT_GENDER_COMPOSITIONS),
  elevatorAvailable: z.boolean(),
  parkingAvailable: z.boolean(),
  parkingType: z.enum(PARKING_TYPES).nullish(),
  parkingDescription: z.string().nullish(),
});

export const draftPrivateSpaceDataSchema = z.object({
  rentalSpaceType: z.enum(RENTAL_SPACE_TYPES),
  rentalSpaceTypeOther: z.string().nullish(),
  privateRoomSize: z.enum(PRIVATE_ROOM_SIZES),
  privateRoomOptions: z.array(z.enum(PRIVATE_ROOM_OPTIONS_VALUES)),
});

export const draftCommonFacilitiesDataSchema = z.object({
  kitchenUsagePolicy: z.enum(KITCHEN_USAGE_POLICIES),
  livingRoomUsagePolicy: z.enum(LIVING_ROOM_USAGE_POLICIES),
  washingMachineUsagePolicy: z.enum(WASHING_MACHINE_USAGE_POLICIES),
  bathroomUsageType: z.enum(BATHROOM_USAGE_TYPES),
  bathroomDescription: z.string().nullish(),
});

export const draftPreferencesDataSchema = z.object({
  visitorPolicy: z.enum(VISITOR_POLICIES),
  petAllowed: z.boolean(),
  smokingPreference: z.enum(SMOKING_PREFERENCES),
  preferredGender: z.enum(PREFERRED_GENDERS),
  roomCapacity: z.enum(ROOM_CAPACITIES),
  interactionPreference: z.enum(INTERACTION_PREFERENCES),
  additionalGuidance: z.string().nullish(),
});

export const draftPricingDataSchema = z.object({
  monthlyRentKrw: z.number().int(),
  depositKrw: z.number().int(),
  maintenanceFeeKrw: z.number().int(),
  moveInAvailableAt: z.string(),
  minStayMonths: z.number().int(),
});

export const draftMediaDataSchema = z.object({
  mediaIds: z.array(z.uuid()),
  representativeMediaId: z.uuid(),
});

export const draftDescriptionsDataSchema = z.object({
  roomDescription: z.string().nullish(),
  currentResidentsDescription: z.string().nullish(),
  precautions: z.string().nullish(),
});

/** 동의 2종은 계약이 추가되기 전에 만든 초안에서 null입니다. */
export const draftContactDataSchema = z.object({
  contactName: z.string(),
  contactPhone: z.string(),
  preferredContactTime: z.enum(PREFERRED_CONTACT_TIMES),
  preferredContactMethod: z.enum(PREFERRED_CONTACT_METHODS),
  roomPublication: z.literal(true).nullish(),
  noFraudPledge: z.literal(true).nullish(),
});

/** OpenAPI: DraftDataResponse — 아직 저장하지 않은 단계는 null입니다. */
export const draftDataSchema = z.object({
  registrant: draftRegistrantDataSchema.nullable(),
  location: draftLocationDataSchema.nullable(),
  household: draftHouseholdDataSchema.nullable(),
  privateSpace: draftPrivateSpaceDataSchema.nullable(),
  commonFacilities: draftCommonFacilitiesDataSchema.nullable(),
  preferences: draftPreferencesDataSchema.nullable(),
  pricing: draftPricingDataSchema.nullable(),
  media: draftMediaDataSchema.nullable(),
  descriptions: draftDescriptionsDataSchema.nullable(),
  contact: draftContactDataSchema.nullable(),
});

export type DraftDataDto = z.infer<typeof draftDataSchema>;

/* 미디어 */

export const draftMediaSchema = z.object({
  id: z.uuid(),
  displayOrder: z.number().int(),
  isRepresentative: z.boolean(),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  byteSize: z.number().int(),
  originalFilename: z.string(),
  readUrl: z.string(),
  readUrlExpiresAt: z.string(),
});

export type DraftMediaDto = z.infer<typeof draftMediaSchema>;

const apiStepSchema = z.union(API_STEPS.map((step) => z.literal(step)));

/* 자동 임시저장 */

/**
 * OpenAPI: DraftAutosaveEntryResponse
 *
 * `data`는 검증 전 부분 입력 snapshot이라 서버도 형태를 고정하지 않습니다.
 * 화면이 값을 쓰기 전에 각자 좁혀야 하므로 여기서는 unknown으로 받습니다.
 */
export const draftAutosaveEntrySchema = z.object({
  step: apiStepSchema,
  data: z.record(z.string(), z.unknown()),
});

export type DraftAutosaveEntryDto = z.infer<typeof draftAutosaveEntrySchema>;

/* 초안 응답 */

export const draftSummarySchema = z.object({
  draftId: z.uuid(),
  roomId: z.uuid(),
  version: z.number().int(),
  nextStep: apiStepSchema.nullable(),
  completedSteps: z.array(apiStepSchema),
  mediaCount: z.number().int(),
  lastSavedAt: z.string(),
  expiresAt: z.string(),
});

export type DraftSummaryDto = z.infer<typeof draftSummarySchema>;

export const draftDetailSchema = z.object({
  draftId: z.uuid(),
  roomId: z.uuid(),
  version: z.number().int(),
  nextStep: apiStepSchema.nullable(),
  completedSteps: z.array(apiStepSchema),
  lastSavedAt: z.string(),
  expiresAt: z.string(),
  autosaves: z.array(draftAutosaveEntrySchema),
  data: draftDataSchema,
  media: z.array(draftMediaSchema),
});

export type DraftDetailDto = z.infer<typeof draftDetailSchema>;

export const draftListSchema = z.array(draftSummarySchema);

/** OpenAPI: DraftMediaMutationResponseDto */
export const draftMediaMutationSchema = z.object({
  version: z.number().int(),
  nextStep: apiStepSchema.nullable(),
  completedSteps: z.array(apiStepSchema),
  lastSavedAt: z.string(),
  media: z.array(draftMediaSchema),
});

export type DraftMediaMutationDto = z.infer<typeof draftMediaMutationSchema>;

/** OpenAPI: RoomSubmissionResponse */
export const roomSubmissionSchema = z.object({
  roomId: z.uuid(),
  roomStatus: z.literal("submitted"),
  submittedAt: z.string(),
});

export type RoomSubmissionDto = z.infer<typeof roomSubmissionSchema>;

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
} from "../model/listing-options";
import { API_STEPS } from "../model/listing-step";

/* 단계별 저장 데이터 (OpenAPI: Draft*DataResponse) */

export const draftRegistrantDataSchema = z.object({
  registrantRelationship: z.enum(REGISTRANT_RELATIONSHIPS),
});

export const draftLocationDataSchema = z.object({
  addressRoad: z.string(),
  addressDetail: z.string(),
  addressRegion: z.string(),
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

export const draftContactDataSchema = z.object({
  contactName: z.string(),
  contactPhone: z.string(),
  preferredContactTime: z.enum(PREFERRED_CONTACT_TIMES),
  preferredContactMethod: z.enum(PREFERRED_CONTACT_METHODS),
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

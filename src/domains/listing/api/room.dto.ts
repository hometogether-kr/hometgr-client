import { z } from "zod";

import {
  BUILDING_TYPES,
  PARKING_TYPES,
  PRIVATE_ROOM_OPTIONS_VALUES,
  PRIVATE_ROOM_SIZES,
  RESIDENT_GENDER_COMPOSITIONS,
  RESIDENT_TYPES,
} from "@/domains/listing-draft";

/**
 * `GET /rooms/:id` 응답 (OpenAPI: PublicRoomDetailResponse)
 *
 * 백엔드는 등록 계약 버전(레거시/v2)과 조회자 접근 수준(preview/full)에 따라
 * 4갈래로 서로 다른 모양을 내려준다. 화면이 실제로 쓰는 필드만 검증하면 되므로
 * (zod object는 초과 키를 무시한다) 백엔드 DTO 전체를 복제하지 않는다.
 */

const publicHostDtoSchema = z
  .object({
    name: z.string().nullable(),
    createdAt: z.string(),
  })
  .nullable();

export type PublicHostDto = z.infer<typeof publicHostDtoSchema>;

const publicMediaDtoSchema = z.object({
  id: z.string(),
  displayOrder: z.number().int(),
  isRepresentative: z.boolean(),
  readUrl: z.string(),
});

export type PublicMediaDto = z.infer<typeof publicMediaDtoSchema>;

const commonDtoSchema = z.object({
  host: publicHostDtoSchema,
  mediaCount: z.number().int(),
});

/* 비회원 미리보기 — 레거시/v2 공통으로 room 식별자·지역·가격·대표사진만 있다 */

const legacyPreviewPricingSchema = z.object({
  monthlyRentKrw: z.number().nullable(),
  depositKrw: z.number().nullable(),
  maintenanceFeeKrw: z.number().nullable(),
});

const registrationPreviewPricingSchema = z.object({
  monthlyRentKrw: z.number(),
  depositKrw: z.number(),
  maintenanceFeeKrw: z.number(),
});

const legacyPreviewPayloadSchema = z.object({
  roomId: z.string(),
  addressRegion: z.string().nullable(),
  pricing: legacyPreviewPricingSchema,
  representativeMedia: publicMediaDtoSchema.nullable(),
});

const registrationPreviewPayloadSchema = z.object({
  roomId: z.string(),
  addressRegion: z.string().nullable(),
  approximateLocation: z.string().nullable(),
  pricing: registrationPreviewPricingSchema,
  /**
   * 백엔드 타입은 필수로 선언돼 있지만 실제 dev 데이터에서 mediaCount > 0인데도
   * null인 경우가 관측돼(대표 사진 미지정 등) 방어적으로 nullable 처리한다.
   */
  representativeMedia: publicMediaDtoSchema.nullable(),
});

export const legacyPreviewDetailSchema = commonDtoSchema.extend({
  registrationContractVersion: z.null(),
  viewerAccess: z.literal("preview"),
  preview: legacyPreviewPayloadSchema,
});

export const registrationPreviewDetailSchema = commonDtoSchema.extend({
  registrationContractVersion: z.literal(2),
  viewerAccess: z.literal("preview"),
  preview: registrationPreviewPayloadSchema,
});

/* 회원 전체 상세 — 레거시는 평탄한 구조, v2는 단계별 data 하위 객체로 나뉜다 */

const legacyFullDetailSchema = commonDtoSchema.extend({
  registrationContractVersion: z.null(),
  viewerAccess: z.literal("full"),
  id: z.string(),
  title: z.string().nullish(),
  addressRegion: z.string().nullish(),
  depositKrw: z.number().nullable(),
  monthlyRentKrw: z.number().nullable(),
  maintenanceFeeKrw: z.number().nullable(),
  floor: z.number().int().nullish(),
  totalFloors: z.number().int().nullish(),
  areaSquareMeters: z.number().nullish(),
  availableFrom: z.string().nullish(),
  availabilityStatus: z.enum(["immediate", "occupied", "scheduled"]).nullish(),
  description: z.string().nullish(),
  amenities: z.array(z.string()),
  media: z.array(publicMediaDtoSchema),
});

const registrationLocationDataSchema = z.object({
  addressRoad: z.string().nullish(),
  addressDetail: z.string().nullish(),
  addressRegion: z.string().nullable(),
  buildingType: z.enum(BUILDING_TYPES),
  buildingTypeOther: z.string().nullable(),
  approximateLocation: z.string().nullable(),
});

const registrationHouseholdDataSchema = z.object({
  residentCount: z.number().int(),
  residentType: z.enum(RESIDENT_TYPES),
  residentGenderComposition: z.enum(RESIDENT_GENDER_COMPOSITIONS),
  elevatorAvailable: z.boolean(),
  parkingAvailable: z.boolean(),
  parkingType: z.enum(PARKING_TYPES).nullable(),
  parkingDescription: z.string().nullable(),
});

const registrationPrivateSpaceDataSchema = z.object({
  privateRoomSize: z.enum(PRIVATE_ROOM_SIZES),
  privateRoomOptions: z.array(z.enum(PRIVATE_ROOM_OPTIONS_VALUES)),
});

const registrationPreferencesDataSchema = z.object({
  petAllowed: z.boolean(),
});

const registrationPricingDataSchema = z.object({
  monthlyRentKrw: z.number(),
  depositKrw: z.number(),
  maintenanceFeeKrw: z.number(),
  moveInAvailableAt: z.string(),
  minStayMonths: z.number().int(),
});

const registrationDescriptionsDataSchema = z.object({
  roomDescription: z.string().nullish(),
});

export const registrationFullDetailSchema = commonDtoSchema.extend({
  registrationContractVersion: z.literal(2),
  viewerAccess: z.literal("full"),
  roomId: z.string(),
  data: z.object({
    location: registrationLocationDataSchema,
    household: registrationHouseholdDataSchema,
    privateSpace: registrationPrivateSpaceDataSchema,
    preferences: registrationPreferencesDataSchema,
    pricing: registrationPricingDataSchema,
    descriptions: registrationDescriptionsDataSchema,
  }),
  media: z.array(publicMediaDtoSchema),
});

export const publicRoomDetailSchema = z.union([
  legacyPreviewDetailSchema,
  registrationPreviewDetailSchema,
  legacyFullDetailSchema,
  registrationFullDetailSchema,
]);

export type PublicRoomDetailDto = z.infer<typeof publicRoomDetailSchema>;
export type LegacyFullDetailDto = z.infer<typeof legacyFullDetailSchema>;
export type RegistrationFullDetailDto = z.infer<typeof registrationFullDetailSchema>;
export type LegacyPreviewDetailDto = z.infer<typeof legacyPreviewDetailSchema>;
export type RegistrationPreviewDetailDto = z.infer<typeof registrationPreviewDetailSchema>;

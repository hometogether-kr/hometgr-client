import { z } from "zod";

import {
  AREA_RANGES,
  BUILDING_TYPES,
  type ListingDraft,
  PARKING_TYPES,
  PRIVATE_ROOM_OPTIONS_VALUES,
  RENTAL_SPACE_TYPES,
  RESIDENT_GENDER_COMPOSITIONS,
  RESIDENT_TYPES,
} from "@/domains/listing-draft";

export const locationFormSchema = z.object({
  addressRoad: z.string().default(""),
  addressJibun: z.string().default(""),
  addressDetail: z.string().default(""),
  addressRegion: z.string().default(""),
  legalDongCode: z.string().default(""),
  legalDongName: z.string().default(""),
  sido: z.string().default(""),
  sigungu: z.string().default(""),
  buildingDong: z.string().default(""),
  unitNumber: z.string().default(""),
  approximateLocation: z.string().default(""),
  buildingType: z.enum(BUILDING_TYPES).nullable().default(null),
  buildingTypeOther: z.string().default(""),
});

export const householdFormSchema = z.object({
  areaRange: z.enum(AREA_RANGES).nullable().default(null),
  totalRoomCount: z.number().int().min(0).max(100).default(0),
  residentCount: z.number().int().min(0).max(100).nullable().default(null),
  residentType: z.enum(RESIDENT_TYPES).nullable().default(null),
  residentGenderComposition: z.enum(RESIDENT_GENDER_COMPOSITIONS).nullable().default(null),
  elevatorAvailable: z.boolean().nullable().default(null),
  parkingAvailable: z.boolean().nullable().default(null),
  parkingType: z.enum(PARKING_TYPES).nullable().default(null),
  parkingDescription: z.string().default(""),
});

export const privateSpaceFormSchema = z.object({
  rentalSpaceType: z.enum(RENTAL_SPACE_TYPES).nullable().default(null),
  rentalSpaceTypeOther: z.string().default(""),
  privateRoomOptions: z.array(z.enum(PRIVATE_ROOM_OPTIONS_VALUES)).default([]),
});

export type LocationForm = z.infer<typeof locationFormSchema>;
export type HouseholdForm = z.infer<typeof householdFormSchema>;
export type PrivateSpaceForm = z.infer<typeof privateSpaceFormSchema>;
export type EditableDraftStep = 3 | 4 | 5;

export const draftFormSchemas = {
  3: locationFormSchema,
  4: householdFormSchema,
  5: privateSpaceFormSchema,
};

const draftGroups = { 3: "location", 4: "household", 5: "privateSpace" } as const;

/** A snapshot is partial input, not a completed step. Recover each field independently. */
export function restoreDraftForm<T extends Record<string, z.ZodType>>(
  draft: ListingDraft,
  step: EditableDraftStep,
  schema: z.ZodObject<T>,
) {
  const saved = draft.data[draftGroups[step]];
  const snapshot = draft.autosaves.find((entry) => entry.step === step)?.data;
  const source: Record<string, unknown> = { ...saved, ...snapshot };
  const recovered: Record<string, unknown> = {};
  const warnings: string[] = [];
  for (const [key, field] of Object.entries(schema.shape)) {
    const raw = source[key];
    // Completed responses use null for optional text; forms use empty strings.
    const parsed = field.safeParse(raw === null && field.safeParse("").success ? "" : raw);
    if (parsed.success) recovered[key] = parsed.data;
    else
      warnings.push(
        key === "buildingType" && raw === "villa"
          ? "기존 건물 유형은 빌라입니다. 새 등록 기준에 맞는 유형을 직접 다시 선택해주세요."
          : `${key}: 이전 입력을 복원할 수 없습니다. 해당 항목을 다시 확인해주세요.`,
      );
  }
  if (snapshot && ("privateRoomSize" in snapshot || "areaSquareMeters" in snapshot)) {
    warnings.push(
      "이전 면적 입력은 더 이상 사용하지 않습니다. 집 전체 면적 구간과 현재 단계 입력을 확인한 뒤 다음으로 진행해주세요.",
    );
  }
  if (recovered.residentCount === 0) {
    recovered.residentType = null;
    recovered.residentGenderComposition = null;
  }
  return { values: schema.parse(recovered), warnings };
}

export function toLocationInput(values: LocationForm) {
  return Object.fromEntries(
    Object.entries(values)
      .filter(
        ([key, value]) =>
          typeof value === "string" &&
          value.trim() !== "" &&
          (key !== "buildingTypeOther" || values.buildingType === "other"),
      )
      .map(([key, value]) => [key, typeof value === "string" ? value.trim() : value]),
  );
}

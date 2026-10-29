import type { HostRoomDetail } from "@/domains/listing-draft";
import { type ListingEditSnapshot } from "@/features/manage-listing";
import {
  householdFormSchema,
  locationFormSchema,
  parseKrwAmount,
  parseStayMonths,
  privateSpaceFormSchema,
  STEP_DATA_SCHEMA,
  toKstIsoString,
  toLocationInput,
} from "@/features/save-listing-draft";
import type {
  ListingStep2Values,
  ListingStep3InitialValues,
  ListingStep4InitialValues,
  ListingStep5InitialValues,
  ListingStep6InitialValues,
  ListingStep7InitialValues,
  ListingStep9Values,
} from "@/widgets/listing-step-layout";

export interface EditorValues {
  title: string;
  registrant: NonNullable<HostRoomDetail["data"]["registrant"]>["registrantRelationship"] | null;
  location: ListingStep2Values;
  household: ListingStep3InitialValues;
  privateSpace: ListingStep4InitialValues;
  commonFacilities: ListingStep5InitialValues;
  preferences: ListingStep6InitialValues;
  pricing: ListingStep7InitialValues;
  descriptions: ListingStep9Values;
  photos: HostRoomDetail["media"];
}

function nonNullText(object: object | null) {
  return Object.fromEntries(
    Object.entries(object ?? {}).map(([key, value]) => [key, value === null ? undefined : value]),
  );
}

export function createEditorValues(room: HostRoomDetail): EditorValues {
  const d = room.data;
  return {
    title: room.title ?? "",
    registrant: d.registrant?.registrantRelationship ?? null,
    location: locationFormSchema.parse({
      ...nonNullText(d.location),
      buildingType: d.location?.buildingType === "villa" ? null : d.location?.buildingType,
    }),
    household: householdFormSchema.parse(
      d.household
        ? { ...d.household, parkingDescription: d.household.parkingDescription ?? "" }
        : {},
    ),
    privateSpace: privateSpaceFormSchema.parse(nonNullText(d.privateSpace)),
    commonFacilities: {
      kitchenUsagePolicy: d.commonFacilities?.kitchenUsagePolicy ?? null,
      livingRoomUsagePolicy: d.commonFacilities?.livingRoomUsagePolicy ?? null,
      washingMachineUsagePolicy: d.commonFacilities?.washingMachineUsagePolicy ?? null,
      bathroomUsageType: d.commonFacilities?.bathroomUsageType ?? null,
      bathroomDescription: d.commonFacilities?.bathroomDescription ?? "",
    },
    preferences: {
      visitorPolicy: d.preferences?.visitorPolicy ?? null,
      petAllowed: d.preferences?.petAllowed ?? null,
      smokingPreference: d.preferences?.smokingPreference ?? null,
      preferredGender: d.preferences?.preferredGender ?? null,
      roomCapacity: d.preferences?.roomCapacity ?? null,
      interactionPreference: d.preferences?.interactionPreference ?? null,
      additionalGuidance: d.preferences?.additionalGuidance ?? "",
    },
    pricing: {
      monthlyRent: d.pricing ? String(d.pricing.monthlyRentKrw) : "",
      deposit: d.pricing ? String(d.pricing.depositKrw) : "",
      maintenanceFee: d.pricing ? String(d.pricing.maintenanceFeeKrw) : "",
      moveInAvailableOn: d.pricing
        ? new Intl.DateTimeFormat("sv-SE", {
            timeZone: "Asia/Seoul",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }).format(new Date(d.pricing.moveInAvailableAt))
        : "",
      minStay: d.pricing ? `${d.pricing.minStayMonths}개월` : "",
    },
    descriptions: {
      roomDescription: d.descriptions?.roomDescription ?? "",
      currentResidentsDescription: d.descriptions?.currentResidentsDescription ?? "",
      precautions: d.descriptions?.precautions ?? "",
    },
    photos: [...room.media].sort((a, b) => a.displayOrder - b.displayOrder),
  };
}

const optionalText = (text: string) => text.trim() || undefined;

/** 등록과 동일한 조건부 필드와 검증을 사용하고 연락처·동의는 원본을 보존합니다. */
export function buildEditSnapshot(room: HostRoomDetail, values: EditorValues): ListingEditSnapshot {
  const p = values.pricing;
  return {
    title: values.title.trim(),
    media: values.photos.map((photo, index) => ({
      ...photo,
      displayOrder: index,
      isRepresentative: index === 0,
    })),
    data: {
      ...room.data,
      registrant: STEP_DATA_SCHEMA[2].parse({ registrantRelationship: values.registrant }),
      location: STEP_DATA_SCHEMA[3].parse(toLocationInput(values.location)),
      household: STEP_DATA_SCHEMA[4].parse({
        ...values.household,
        parkingType: values.household.parkingAvailable ? values.household.parkingType : undefined,
        parkingDescription: values.household.parkingAvailable
          ? optionalText(values.household.parkingDescription)
          : undefined,
      }),
      privateSpace: STEP_DATA_SCHEMA[5].parse({
        ...values.privateSpace,
        rentalSpaceTypeOther:
          values.privateSpace.rentalSpaceType === "other"
            ? optionalText(values.privateSpace.rentalSpaceTypeOther)
            : undefined,
      }),
      commonFacilities: STEP_DATA_SCHEMA[6].parse({
        ...values.commonFacilities,
        bathroomDescription: optionalText(values.commonFacilities.bathroomDescription),
      }),
      preferences: STEP_DATA_SCHEMA[7].parse({
        ...values.preferences,
        additionalGuidance: optionalText(values.preferences.additionalGuidance),
      }),
      pricing: STEP_DATA_SCHEMA[8].parse({
        monthlyRentKrw: parseKrwAmount(p.monthlyRent),
        depositKrw: parseKrwAmount(p.deposit),
        maintenanceFeeKrw: parseKrwAmount(p.maintenanceFee),
        moveInAvailableAt: toKstIsoString(p.moveInAvailableOn),
        minStayMonths: parseStayMonths(p.minStay),
      }),
      descriptions: STEP_DATA_SCHEMA[10].parse({
        roomDescription: optionalText(values.descriptions.roomDescription),
        currentResidentsDescription: optionalText(values.descriptions.currentResidentsDescription),
        precautions: optionalText(values.descriptions.precautions),
      }),
      media: STEP_DATA_SCHEMA[9].parse({
        mediaIds: values.photos.map((photo) => photo.id),
        representativeMediaId: values.photos[0]?.id,
      }),
    },
  };
}

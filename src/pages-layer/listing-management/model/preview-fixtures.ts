import { hostRoomDetailSchema, hostRoomSummarySchema } from "@/domains/listing-draft";

const roomId = (index: number) => `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`;
export const PREVIEW_ROOMS = [
  "published",
  "submitted",
  "published",
  "hidden",
  "contractInProgress",
].map((status, index) =>
  hostRoomSummarySchema.parse({
    id: roomId(index + 1),
    title: "햇살 가득한 연남동 주택 게스트룸",
    registrationContractVersion: 2,
    roomStatus: status,
    isPublic: index === 0 || index === 2,
    addressRegion: "서울특별시 마포구 망원동",
    approximateLocation: null,
    createdAt: "2023-11-02T00:00:00+09:00",
  }),
);

/** Figma에 있는 예시 데이터만 사용합니다. 실제 서비스 조회/저장에 혼입하지 않습니다. */
export const PREVIEW_ROOM = hostRoomDetailSchema.parse({
  roomId: roomId(1),
  title: "햇살 가득한 연남동 주택",
  subtitle: null,
  registrationContractVersion: 2,
  roomStatus: "published",
  isPublic: true,
  submittedAt: "2023-11-02T00:00:00+09:00",
  data: {
    registrant: { registrantRelationship: "owner" },
    location: {
      addressRoad: "서울특별시 마포구 망원동",
      addressJibun: null,
      addressRegion: "서울특별시 마포구 망원동",
      addressDetail: "",
      buildingType: "detachedHouse",
      buildingTypeOther: null,
      approximateLocation: null,
    },
    household: {
      areaRange: "thirtiesPyeong",
      totalRoomCount: 4,
      residentCount: 1,
      residentType: "ownerOnly",
      residentGenderComposition: "femaleOnly",
      elevatorAvailable: false,
      parkingAvailable: false,
      parkingType: null,
      parkingDescription: null,
    },
    privateSpace: {
      rentalSpaceType: "onePrivateRoom",
      rentalSpaceTypeOther: null,
      privateRoomOptions: ["bed", "desk", "airConditioner"],
    },
    commonFacilities: {
      kitchenUsagePolicy: "freeUse",
      livingRoomUsagePolicy: "sharedWithHost",
      washingMachineUsagePolicy: "freeUse",
      bathroomUsageType: "sharedWithHost",
      bathroomDescription: null,
    },
    preferences: {
      visitorPolicy: "notAllowed",
      petAllowed: false,
      smokingPreference: "nonSmokerOnly",
      preferredGender: "any",
      roomCapacity: "one",
      interactionPreference: "quiet",
      additionalGuidance: null,
    },
    pricing: {
      monthlyRentKrw: 650000,
      depositKrw: 0,
      maintenanceFeeKrw: 0,
      moveInAvailableAt: "2026-11-01T00:00:00+09:00",
      minStayMonths: 6,
    },
    descriptions: { roomDescription: "", currentResidentsDescription: "", precautions: "" },
    media: {
      mediaIds: Array.from({ length: 6 }, (_, i) => roomId(100 + i)),
      representativeMediaId: roomId(100),
    },
    contact: {
      contactName: "",
      contactPhone: "",
      preferredContactTime: "morning",
      preferredContactMethod: "phoneCall",
      roomPublication: true,
      noFraudPledge: true,
    },
  },
  media: Array.from({ length: 6 }, (_, i) => ({
    id: roomId(100 + i),
    displayOrder: i,
    isRepresentative: i === 0,
    mimeType: "image/png",
    byteSize: 1,
    originalFilename: "room.png",
    readUrl: "/images/listing-management/preview-bedroom.png",
    readUrlExpiresAt: "2027-01-01T00:00:00+09:00",
  })),
});

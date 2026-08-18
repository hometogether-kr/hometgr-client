import {
  BUILDING_TYPE_LABEL,
  PARKING_TYPE_OPTIONS,
  PRIVATE_ROOM_OPTION_LABEL,
  PRIVATE_ROOM_SIZE_LABEL,
  RESIDENT_GENDER_COMPOSITION_LABEL,
  RESIDENT_TYPE_LABEL,
} from "@/domains/listing-draft";

import type { RoomDetail, RoomHost, RoomPhoto } from "../model/room";
import type {
  LegacyFullDetailDto,
  LegacyPreviewDetailDto,
  PublicHostDto,
  PublicMediaDto,
  PublicRoomDetailDto,
  RegistrationFullDetailDto,
  RegistrationPreviewDetailDto,
} from "./room.dto";

/** 회원 여부와 무관하게 항상 노출하는 고정 안내 문구 — 서버가 값을 내려주지 않는다 */
const ADDRESS_DISCLOSURE_NOTE = "상세 주소는 방문 예약 확정 후 공개됩니다";
const LOCATION_NOTE = "상세 위치는 방문 예약 후 확인할 수 있습니다.";
const SQUARE_METERS_PER_PYEONG = 3.3058;

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function formatDate(isoDate: string): string | null {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}.${pad2(date.getMonth() + 1)}.${pad2(date.getDate())}`;
}

function toHost(host: PublicHostDto): RoomHost {
  if (host === null) return { id: null, name: null, joinedLabel: "" };

  const joined = new Date(host.createdAt);
  const joinedLabel = Number.isNaN(joined.getTime())
    ? ""
    : `${joined.getFullYear()}년 ${joined.getMonth() + 1}월`;

  return { id: null, name: host.name, joinedLabel };
}

function toPhotos(media: readonly PublicMediaDto[], alt: string): RoomPhoto[] {
  return [...media]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((item) => ({ id: item.id, url: item.readUrl, alt }));
}

/** 오늘 이전/당일이면 "즉시 입주 가능", 아니면 날짜를 그대로 안내한다 */
function toMoveInLabel(moveInAvailableAt: string): string {
  const date = new Date(moveInAvailableAt);
  if (Number.isNaN(date.getTime())) return "입주 가능일 확인 필요";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date.getTime() <= today.getTime()) return "즉시 입주 가능";

  return `${formatDate(moveInAvailableAt)}부터 입주 가능`;
}

function toLegacyMoveInLabel(
  availableFrom: string | null | undefined,
  availabilityStatus: "immediate" | "occupied" | "scheduled" | null | undefined,
): string {
  if (availabilityStatus === "immediate") return "즉시 입주 가능";
  if (availableFrom) {
    const formatted = formatDate(availableFrom);
    if (formatted) return `${formatted}부터 입주 가능`;
  }
  return "입주 가능일 확인 필요";
}

/* 비회원 미리보기 — room 식별자·지역·가격·대표사진만 있고 그 외는 화면에서 쓰지 않는다 */

function toLegacyPreviewDetail(dto: LegacyPreviewDetailDto): RoomDetail {
  const { preview } = dto;
  const locationSummary = preview.addressRegion ?? "";

  return {
    id: preview.roomId,
    title: locationSummary || "매물 정보",
    addressRegion: preview.addressRegion,
    addressDisclosureNote: ADDRESS_DISCLOSURE_NOTE,
    locationSummary,
    price: {
      depositKrw: preview.pricing.depositKrw ?? 0,
      monthlyRentKrw: preview.pricing.monthlyRentKrw ?? 0,
      maintenanceFeeKrw: preview.pricing.maintenanceFeeKrw ?? 0,
    },
    buildingTypeLabel: "",
    roomSizeLabel: "",
    moveInLabel: "",
    parkingLabel: "",
    petPolicyLabel: "",
    description: "",
    amenities: [],
    photos: preview.representativeMedia ? toPhotos([preview.representativeMedia], "매물 사진") : [],
    locationNote: LOCATION_NOTE,
    host: toHost(dto.host),
  };
}

function toRegistrationPreviewDetail(dto: RegistrationPreviewDetailDto): RoomDetail {
  const { preview } = dto;
  const locationSummary = preview.approximateLocation ?? preview.addressRegion ?? "";

  return {
    id: preview.roomId,
    title: locationSummary || "매물 정보",
    addressRegion: preview.addressRegion,
    addressDisclosureNote: ADDRESS_DISCLOSURE_NOTE,
    locationSummary,
    price: {
      depositKrw: preview.pricing.depositKrw,
      monthlyRentKrw: preview.pricing.monthlyRentKrw,
      maintenanceFeeKrw: preview.pricing.maintenanceFeeKrw,
    },
    buildingTypeLabel: "",
    roomSizeLabel: "",
    moveInLabel: "",
    parkingLabel: "",
    petPolicyLabel: "",
    description: "",
    amenities: [],
    photos: preview.representativeMedia ? toPhotos([preview.representativeMedia], "매물 사진") : [],
    locationNote: LOCATION_NOTE,
    host: toHost(dto.host),
  };
}

/* 회원 전체 상세 */

function toLegacyFullDetail(dto: LegacyFullDetailDto): RoomDetail {
  const locationSummary = dto.addressRegion ?? "";
  const title = dto.title ?? locationSummary ?? "매물 정보";
  const areaPyeong =
    dto.areaSquareMeters != null ? Math.round(dto.areaSquareMeters / SQUARE_METERS_PER_PYEONG) : null;

  return {
    id: dto.id,
    title,
    addressRegion: dto.addressRegion ?? null,
    addressDisclosureNote: ADDRESS_DISCLOSURE_NOTE,
    locationSummary,
    price: {
      depositKrw: dto.depositKrw ?? 0,
      monthlyRentKrw: dto.monthlyRentKrw ?? 0,
      maintenanceFeeKrw: dto.maintenanceFeeKrw ?? 0,
    },
    // 레거시 매물의 건물 유형(PropertyType)은 아직 화면 라벨로 매핑하지 않았다.
    buildingTypeLabel: "확인 필요",
    roomSizeLabel: areaPyeong != null ? `${areaPyeong}평` : "확인 필요",
    floor: dto.floor ?? undefined,
    moveInLabel: toLegacyMoveInLabel(dto.availableFrom, dto.availabilityStatus),
    parkingLabel: "확인 필요",
    petPolicyLabel: "확인 필요",
    description: dto.description ?? "",
    amenities: dto.amenities,
    photos: toPhotos(dto.media, title),
    locationNote: LOCATION_NOTE,
    host: toHost(dto.host),
  };
}

function toRegistrationFullDetail(dto: RegistrationFullDetailDto): RoomDetail {
  const { location, household, privateSpace, preferences, pricing, descriptions } = dto.data;

  const buildingTypeLabel =
    location.buildingType === "other"
      ? (location.buildingTypeOther ?? "기타")
      : BUILDING_TYPE_LABEL[location.buildingType];
  const locationSummary = location.approximateLocation ?? location.addressRegion ?? "";
  const title = [locationSummary, buildingTypeLabel].filter(Boolean).join(" ") || "매물 정보";

  const amenities = privateSpace.privateRoomOptions
    .filter((option) => option !== "none")
    .map((option) => PRIVATE_ROOM_OPTION_LABEL[option]);
  if (household.elevatorAvailable) amenities.push("엘리베이터");
  if (household.parkingAvailable) amenities.push("주차 가능");

  const parkingLabel = household.parkingAvailable
    ? [
        PARKING_TYPE_OPTIONS.find((option) => option.value === household.parkingType)?.label,
        household.parkingDescription,
      ]
        .filter(Boolean)
        .join(" · ") || "주차 가능"
    : "주차 불가";

  return {
    id: dto.roomId,
    title,
    addressRegion: location.addressRegion,
    addressDisclosureNote: ADDRESS_DISCLOSURE_NOTE,
    locationSummary,
    price: {
      depositKrw: pricing.depositKrw,
      monthlyRentKrw: pricing.monthlyRentKrw,
      maintenanceFeeKrw: pricing.maintenanceFeeKrw,
    },
    buildingTypeLabel,
    roomSizeLabel: PRIVATE_ROOM_SIZE_LABEL[privateSpace.privateRoomSize],
    // v2 등록 플로우는 층수를 입력받지 않는다 — floor는 항상 비어 있다.
    floor: undefined,
    moveInLabel: toMoveInLabel(pricing.moveInAvailableAt),
    parkingLabel,
    petPolicyLabel: preferences.petAllowed ? "가능" : "불가",
    description: descriptions.roomDescription ?? "",
    amenities,
    photos: toPhotos(dto.media, title),
    locationNote: LOCATION_NOTE,
    household: {
      residentCount: household.residentCount,
      residentTypeLabel: RESIDENT_TYPE_LABEL[household.residentType],
      genderCompositionLabel: RESIDENT_GENDER_COMPOSITION_LABEL[household.residentGenderComposition],
    },
    host: toHost(dto.host),
  };
}

export function toRoomDetail(dto: PublicRoomDetailDto): RoomDetail {
  if ("preview" in dto) {
    return dto.registrationContractVersion === 2
      ? toRegistrationPreviewDetail(dto)
      : toLegacyPreviewDetail(dto);
  }

  return dto.registrationContractVersion === 2 ? toRegistrationFullDetail(dto) : toLegacyFullDetail(dto);
}

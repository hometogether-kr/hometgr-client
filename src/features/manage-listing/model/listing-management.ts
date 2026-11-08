import type { HostRoomDetail, HostRoomSummary } from "@/domains/listing-draft";

export const LISTING_FILTERS = ["전체", "계약 중", "노출 중", "심사 중", "비공개"] as const;
export type ListingFilter = (typeof LISTING_FILTERS)[number];

export const EDIT_MENUS = [
  { id: "photos", label: "사진 업로드", step: 8 },
  { id: "registrant", label: "등록자 정보", step: 1 },
  { id: "location", label: "매물 기본 정보", description: "주소 및 유형", step: 2 },
  { id: "household", label: "매물 상세 정보", step: 3 },
  { id: "privateSpace", label: "입주자 공간 정보", description: "방 크기 및 옵션", step: 4 },
  { id: "commonFacilities", label: "공용 시설 정보", step: 5 },
  { id: "preferences", label: "생활 안내 및 규칙", step: 6 },
  { id: "pricing", label: "계약 조건", description: "보증금, 월세 등", step: 7 },
  { id: "descriptions", label: "추가 설명", step: 9 },
] as const;
export type EditMenuId = (typeof EDIT_MENUS)[number]["id"];

export function isReviewing(room: Pick<HostRoomSummary, "roomStatus">): boolean {
  return ["submitted", "inReview"].includes(room.roomStatus);
}

export function listingStatus(
  room: HostRoomSummary,
): Exclude<ListingFilter, "전체" | "노출 중"> | "공개 중" {
  if (isReviewing(room)) return "심사 중";
  if (["contractInProgress", "contractCompleted"].includes(room.roomStatus)) return "계약 중";
  return room.isPublic ? "공개 중" : "비공개";
}

/** 순서가 의미 없는 옵션 배열과 객체 키는 정규화해서 비교합니다. 사진 순서는 유지합니다. */
function normalize(value: unknown, key = ""): unknown {
  if (Array.isArray(value)) {
    const items = value.map((item: unknown) => normalize(item));
    return key === "privateRoomOptions" ? items.sort() : items;
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, child]) => [name, normalize(child, name)]),
    );
  }
  return value === null || value === undefined ? "" : value;
}

export function hasListingChanges(original: unknown, current: unknown): boolean {
  return JSON.stringify(normalize(original)) !== JSON.stringify(normalize(current));
}

export interface ListingEditSnapshot {
  title: string;
  data: HostRoomDetail["data"];
  media: HostRoomDetail["media"];
  newPhotos?: readonly { id: string; file: File }[];
}

/** API 계약 확정 후 구현할 저장 경계. 검수 전 공개 데이터와 수정 요청은 분리합니다. */
export interface ListingManagementCommands {
  setVisibility: (roomId: string, isPublic: boolean) => Promise<void>;
  requestChanges: (roomId: string, snapshot: ListingEditSnapshot) => Promise<void>;
}

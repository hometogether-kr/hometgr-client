import type { Room, RoomAvailability, RoomListResult } from "../model/room";
import type { RoomDto, RoomListResponseDto } from "./room.dto";

const KRW_PER_MANWON = 10_000;

/** 원 → 만원. null이면 null(카드가 "가격 문의"로 표시). 예) 10,000,000원 → 1,000만원 */
function toManwon(krw: number | null): number | null {
  return krw === null ? null : Math.round(krw / KRW_PER_MANWON);
}

/**
 * 대표 사진 URL을 고릅니다.
 *
 * `isRepresentative` 우선, 없으면 `displayOrder`가 가장 낮은 사진, 사진이 아예 없으면
 * null(카드가 회색 박스로 대체). readUrl은 만료되는 서명 URL이라 오래 캐시하지 않습니다
 * — 클라이언트 조회 + QueryProvider `staleTime: 60s`로 만료 전에 갱신됩니다.
 */
function pickThumbnail(media: RoomDto["media"]): string | null {
  if (media.length === 0) return null;
  const representative = media.find((m) => m.isRepresentative);
  if (representative) return representative.readUrl;
  return [...media].sort((a, b) => a.displayOrder - b.displayOrder)[0].readUrl;
}

/**
 * `availabilityStatus`(immediate·occupied·scheduled·null) → 2상태 칩.
 *
 * - immediate → available (지금 예약 가능)
 * - scheduled → available (입주 예정이지만 예약은 받는다고 가정) ⚠️ 디자이너 확인
 * - occupied·null·기타 → unavailable (보수적으로)
 *
 * 설계 칩은 2상태뿐이라 3상태를 축약합니다. `scheduled` 전용 상태가 필요하면
 * 여기와 `RoomAvailabilityChip`을 함께 확장합니다.
 */
function toAvailability(status: string | null | undefined): RoomAvailability {
  if (status === "immediate" || status === "scheduled") return "available";
  return "unavailable";
}

export function toRoom(dto: RoomDto): Room {
  return {
    id: dto.id,
    // title이 실데이터에서 비어 옴 → 지역 문자열로 폴백해 카드 제목이 완전히 비지 않게 합니다.
    // ⚠️ 가정한 값: 폴백 문구는 디자이너 확인 대기(설계 §11).
    buildingName: dto.title ?? dto.addressRegion ?? "등록된 매물",
    deposit: toManwon(dto.depositKrw),
    monthlyRent: toManwon(dto.monthlyRentKrw),
    neighborhood: dto.addressRegion ?? "",
    // 교통 요약에 대응하는 API 필드가 없습니다. approximateLocation이 있으면 쓰되 대개 null입니다.
    transitSummary: dto.approximateLocation ?? null,
    thumbnailUrl: pickThumbnail(dto.media),
    availability: toAvailability(dto.availabilityStatus),
    availableFrom: dto.availableFrom ?? null,
  };
}

export function toRoomListResult(dto: RoomListResponseDto): RoomListResult {
  return {
    rooms: dto.items.map(toRoom),
    totalCount: dto.total,
    // page는 런타임이 소수로 줄 수 있어 정수로 고정 — getNextPageParam의 page+1이 어긋나지 않도록.
    page: Math.round(dto.page),
    hasNext: dto.page < dto.totalPages,
  };
}
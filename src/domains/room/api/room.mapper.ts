import type { Room, RoomListResult } from "../model/room";
import type { RoomDto, RoomListResponseDto } from "./room.dto";

const KRW_PER_MANWON = 10_000;

/** 원 → 만원 (표시는 만원 단위). 예) 10,000,000원 → 1,000만원 */
function toManwon(krw: number): number {
  return Math.round(krw / KRW_PER_MANWON);
}

export function toRoom(dto: RoomDto): Room {
  return {
    id: dto.id,
    buildingName: dto.buildingName,
    deposit: toManwon(dto.depositKrw),
    monthlyRent: toManwon(dto.monthlyRentKrw),
    neighborhood: dto.neighborhood,
    transitSummary: dto.transitSummary,
    thumbnailUrl: dto.thumbnailUrl,
    availability: dto.availability,
    availableFrom: dto.availableFrom,
  };
}

export function toRoomListResult(dto: RoomListResponseDto): RoomListResult {
  return {
    rooms: dto.rooms.map(toRoom),
    totalCount: dto.totalCount,
    page: dto.page,
    hasNext: dto.hasNext,
  };
}

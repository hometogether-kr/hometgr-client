import { apiRequest } from "@/shared/api";

import type { RoomDistrict } from "../model/room-district";
import { roomDistrictsResponseSchema } from "./room-districts.schema";

export interface RoomDistrictsQuery {
  sido?: string;
  signal?: AbortSignal;
}

export async function fetchRoomDistricts({
  sido = "서울특별시",
  signal,
}: RoomDistrictsQuery = {}): Promise<RoomDistrict[]> {
  const dto = await apiRequest({
    path: "/rooms/districts",
    searchParams: { sido },
    schema: roomDistrictsResponseSchema,
    signal,
  });

  return dto.items.map(({ sido, sigungu, label }) => ({ sido, sigungu, label }));
}

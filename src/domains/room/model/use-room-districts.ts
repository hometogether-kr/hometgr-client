"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchRoomDistricts } from "../api/room-districts.api";
import { roomQueryKeys } from "../api/room-query-keys";

interface UseRoomDistrictsOptions {
  sido?: string;
  enabled?: boolean;
}

export function useRoomDistricts({
  sido = "서울특별시",
  enabled = true,
}: UseRoomDistrictsOptions = {}) {
  return useQuery({
    queryKey: roomQueryKeys.districts(sido),
    queryFn: ({ signal }) => fetchRoomDistricts({ sido, signal }),
    enabled,
    staleTime: 0,
    retry: false,
  });
}

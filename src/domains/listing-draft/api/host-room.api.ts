import { z } from "zod";

import { apiRequest } from "@/shared/api";

import { draftDataSchema, draftMediaSchema } from "./draft.dto";

export const hostRoomSummarySchema = z.object({
  id: z.uuid(),
  title: z.string().nullable(),
  registrationContractVersion: z.number().nullable(),
  roomStatus: z.string(),
  isPublic: z.boolean(),
  addressRegion: z.string().nullish(),
  approximateLocation: z.string().nullish(),
  createdAt: z.iso.datetime({ offset: true }),
});

export const hostRoomDetailSchema = z.object({
  roomId: z.uuid(),
  title: z.string().nullable(),
  subtitle: z.string().nullable(),
  registrationContractVersion: z.literal(2),
  roomStatus: z.string(),
  isPublic: z.boolean(),
  submittedAt: z.iso.datetime({ offset: true }),
  data: draftDataSchema,
  media: z.array(draftMediaSchema),
});

export type HostRoomSummary = z.infer<typeof hostRoomSummarySchema>;
export type HostRoomDetail = z.infer<typeof hostRoomDetailSchema>;

export const hostRoomQueryKeys = {
  all: ["host-rooms"] as const,
  list: () => [...hostRoomQueryKeys.all, "list"] as const,
  detail: (roomId: string) => [...hostRoomQueryKeys.all, "detail", roomId] as const,
};

export function fetchHostRooms(signal?: AbortSignal): Promise<HostRoomSummary[]> {
  return apiRequest({ path: "/host/rooms", schema: z.array(hostRoomSummarySchema), signal });
}

/** 등록 때 입력한 전체 정보는 공개 상세가 아닌 소유자 상세에서 읽습니다. */
export function fetchHostRoom(roomId: string, signal?: AbortSignal): Promise<HostRoomDetail> {
  return apiRequest({
    path: `/host/rooms/${encodeURIComponent(roomId)}`,
    schema: hostRoomDetailSchema,
    signal,
  });
}

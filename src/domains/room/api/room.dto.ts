import { z } from "zod";

import { ROOM_AVAILABILITIES } from "../model/room";

/**
 * 매물 조회 DTO (서버 계약)
 *
 * 아직 실제 `GET /rooms` 스펙이 확정되지 않아, 도메인 모델을 기준으로 "원 단위 금액 ·
 * 서버가 내려줄 법한 raw shape"으로 정의합니다. 등록 초안(`draftPricingDataSchema`)이
 * `depositKrw`/`monthlyRentKrw`처럼 원 단위를 쓰므로 같은 규약을 따르고, 만원 변환은
 * 매퍼가 담당합니다(설계 §3.4 "API가 원 단위면 매퍼에서 변환").
 *
 * API가 확정되면 이 파일과 `room.mapper.ts`만 교체합니다.
 */
export const roomDtoSchema = z.object({
  id: z.string(),
  buildingName: z.string(),
  depositKrw: z.number().int(),
  monthlyRentKrw: z.number().int(),
  neighborhood: z.string(),
  transitSummary: z.string(),
  thumbnailUrl: z.string(),
  availability: z.enum(ROOM_AVAILABILITIES),
  /** 입주 가능일 — "YYYY-MM-DD" (미정이면 null) */
  availableFrom: z.string().nullable(),
});

export type RoomDto = z.infer<typeof roomDtoSchema>;

export const roomListResponseSchema = z.object({
  rooms: z.array(roomDtoSchema),
  totalCount: z.number().int(),
  page: z.number().int(),
  hasNext: z.boolean(),
});

export type RoomListResponseDto = z.infer<typeof roomListResponseSchema>;

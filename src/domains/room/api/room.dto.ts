import { z } from "zod";

/**
 * 매물 조회 DTO — 실제 `GET /rooms` 계약 (dev-api.hometogether.kr)
 *
 * stage-0 주소 정책이 적용된 공개 목록(`PublicRoomListResponseDto`)입니다. 응답은
 * `apiRequest`가 이 스키마로 검증하고, 계약 위반은 `ApiError(kind:"contract")`로 드러납니다
 * (설계 §6.0c "응답은 parse").
 *
 * 다만 이 dev API는 아직 흔들려서(예: `title`·`approximateLocation`이 응답에서 아예 빠져
 * 오고, 금액이 null) 표시용 soft 필드는 `.nullish()`(없거나 null 허용)로, 아직 안 쓰는
 * enum은 문자열로 느슨하게 받습니다. **값 해석은 전부 매퍼가 전담**합니다 — API가 확정되면
 * 이 파일과 `room.mapper.ts`만 바뀝니다.
 */

/** 공개 사진 — readUrl은 만료 시각(readUrlExpiresAt)이 있는 S3 서명 URL */
const publicRoomMediaSchema = z.object({
  id: z.string(),
  displayOrder: z.number(),
  isRepresentative: z.boolean(),
  mimeType: z.string().nullish(),
  readUrl: z.string(),
  readUrlExpiresAt: z.string().nullish(),
});

export const roomDtoSchema = z.object({
  id: z.string(),
  /** 매물 제목 — 실데이터에서 자주 비어 옴 */
  title: z.string().nullish(),
  /* 유형 4종(v1: propertyType·roomType / v2: buildingType·rentalSpaceType).
     지금은 필터·표시에 쓰지 않아 문자열로만 받아둡니다 — 백엔드 확답 후 사용(설계 §11). */
  propertyType: z.string().nullish(),
  roomType: z.string().nullish(),
  buildingType: z.string().nullish(),
  rentalSpaceType: z.string().nullish(),
  /** stage-0 공개 지역 단위 주소 — 구 단위. 예) "서울시 강남구" */
  addressRegion: z.string().nullish(),
  /** stage-0 approximate-only 위치 안내 — 대개 null */
  approximateLocation: z.string().nullish(),
  /** 금액은 원 단위(nullable) — 만원 변환·null 처리는 매퍼 */
  depositKrw: z.number().int().nullable(),
  monthlyRentKrw: z.number().int().nullable(),
  maintenanceFeeKrw: z.number().int().nullish(),
  /** 입주 가능 날짜 — "YYYY-MM-DD" */
  availableFrom: z.string().nullish(),
  roomStatus: z.string(),
  /** immediate | occupied | scheduled | null — 매퍼가 2상태로 축약 */
  availabilityStatus: z.string().nullish(),
  createdAt: z.string(),
  media: z.array(publicRoomMediaSchema),
});

export type RoomDto = z.infer<typeof roomDtoSchema>;

/** 목록 응답 컨테이너 — page·limit은 런타임이 소수도 반환할 수 있어 int 강제 안 함 */
export const roomListResponseSchema = z.object({
  items: z.array(roomDtoSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export type RoomListResponseDto = z.infer<typeof roomListResponseSchema>;
import type { RoomDetail } from "../model/room";
import { ROOM_DETAIL_FIXTURE } from "./room-fixture";

/**
 * 매물 상세 조회
 *
 * TODO: 공개 매물 상세 API(`GET /rooms/:id`)가 아직 백엔드에 연결되지 않아
 * 고정 목업을 반환합니다. 엔드포인트가 열리면 apiRequest + zod 스키마로 요청하고
 * DTO를 RoomDetail로 매핑하도록 교체하세요 (domains/listing-draft/api 참고).
 */
export function getRoomDetail(roomId: string): Promise<RoomDetail> {
  return Promise.resolve({ ...ROOM_DETAIL_FIXTURE, id: roomId });
}

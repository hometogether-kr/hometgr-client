import type { RoomListResult, RoomSort } from "../model/room";
import { MOCK_ROOM_DTOS } from "./mock-rooms";
import { roomListResponseSchema } from "./room.dto";
import { toRoomListResult } from "./room.mapper";

/**
 * 매물 목록 조회 파라미터 (도메인이 소유하는 조회 계약)
 *
 * FSD상 도메인은 features를 import할 수 없으므로, features/filter-rooms의 `RoomFilter`를
 * 여기서 직접 받지 않습니다. B(HOM-207)가 `RoomFilter` → 이 타입으로 매핑해 호출하고,
 * 필터 필드(지역·가격·유형 등)를 선택적으로 이 인터페이스에 확장합니다. A에서는 `page`만 씁니다.
 */
export interface RoomListQuery {
  /** 조회할 페이지 (1부터) */
  page: number;
  /** 정렬 — 미지정 시 추천순. 목 단계에서는 순서에 영향 없음(B에서 연결) */
  sort?: RoomSort;
}

const PAGE_SIZE = 8;

/**
 * 매물 목록을 조회합니다.
 *
 * 서버 컴포넌트·클라이언트 훅 양쪽에서 호출 가능한 시그니처입니다. 지금은 목 데이터를
 * 쓰지만, 실제 API 응답과 동일한 경로(응답 스키마 `parse` → 매퍼)를 통과시켜 두어
 * API 확정 시 이 함수 본문(목 조립 → `apiRequest` 호출)만 바꾸면 됩니다(설계 §2-5).
 */
export async function fetchRooms(query: RoomListQuery): Promise<RoomListResult> {
  const { page } = query;
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = MOCK_ROOM_DTOS.slice(start, start + PAGE_SIZE);

  const response = {
    rooms: pageItems,
    totalCount: MOCK_ROOM_DTOS.length,
    page,
    hasNext: start + PAGE_SIZE < MOCK_ROOM_DTOS.length,
  };

  // 서버 응답은 계약 위반을 오류로 드러내야 하므로 safeParse가 아닌 parse를 씁니다(설계 §6.0c).
  const dto = roomListResponseSchema.parse(response);
  return Promise.resolve(toRoomListResult(dto));
}

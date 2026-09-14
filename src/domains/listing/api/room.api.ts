import "server-only";

import { backendFetch, readSessionTokens } from "@/shared/api/server";

import type { RoomDetail } from "../model/room";
import { publicRoomDetailSchema } from "./room.dto";
import { toRoomDetail } from "./room.mapper";

/**
 * 매물 상세 조회 (`GET /rooms/:id`)
 *
 * 이 페이지는 Server Component에서 데이터를 받아 client 컴포넌트로 내려주는
 * 구조라(공개 매물 페이지라 첫 페인트가 서버에서 나와야 함) 브라우저 전용 BFF
 * 상대경로(`apiRequest`) 대신 백엔드를 직접 호출한다. access token이 만료돼
 * 401이 나는 드문 경우는 재발급을 시도하지 않고 비회원 미리보기로 취급한다 —
 * Server Component는 쿠키를 쓸 수 없어 토큰 갱신 자체가 불가능하고, 다음
 * 클라이언트 요청에서 BFF의 401 재시도 로직이 알아서 갱신한다.
 *
 * 매물을 찾을 수 없으면 `null`을 반환한다.
 */
export async function getRoomDetail(roomId: string): Promise<RoomDetail | null> {
  const { accessToken } = await readSessionTokens();

  const response = await backendFetch(`/rooms/${roomId}`, { accessToken });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`매물 상세를 불러오지 못했습니다 (status: ${response.status})`);
  }

  const dto = publicRoomDetailSchema.parse(await response.json());
  return toRoomDetail(dto);
}

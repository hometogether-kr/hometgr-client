/**
 * `domains/listing`의 서버 전용 공개 API
 *
 * `getRoomDetail`은 `next/headers`(쿠키)와 `server-only`를 쓴다. 루트 `index.ts`에
 * 함께 두면 Client Component가 `formatManwon`/타입만 가져다 써도 같은 모듈
 * 그래프에 `server-only`가 끼어들어 번들이 깨진다(`shared/api/server`가 이미
 * 쓰는 것과 같은 분리 방식). Server Component 라우트에서만 이 경로로 가져온다.
 */
export { getRoomDetail } from "./api/room.api";

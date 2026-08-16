import { ROOM_GRID_CLASS } from "./room-list-grid";

const SKELETON_COUNT = 8;

function RoomCardSkeleton() {
  return (
    <div>
      <div className="h-[255px] w-full rounded-2xl bg-grayscale-200" />
      <div className="mt-4 flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <div className="h-[25px] w-3/5 rounded bg-grayscale-200" />
          <div className="h-[31px] w-2/5 rounded bg-grayscale-200" />
        </div>
        <div className="h-6 w-4/5 rounded bg-grayscale-200" />
      </div>
    </div>
  );
}

/**
 * 매물 목록 스켈레톤
 *
 * 실제 카드와 같은 그리드·크기로 8장을 깔아 레이아웃 시프트를 0으로 만듭니다.
 * 스크린리더에는 로딩 중임만 알리고 개별 자리표시자는 숨깁니다.
 */
export function RoomListSkeleton() {
  return (
    <div aria-busy="true" aria-hidden="true" className={`${ROOM_GRID_CLASS} animate-pulse`}>
      {Array.from({ length: SKELETON_COUNT }, (_, index) => (
        <RoomCardSkeleton key={index} />
      ))}
    </div>
  );
}

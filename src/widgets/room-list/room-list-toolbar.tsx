interface RoomListToolbarProps {
  totalCount: number;
}

/**
 * 목록 상단 바 — 총 건수 + (정렬 자리)
 *
 * 총 건수는 필터 결과 변화를 스크린리더가 읽도록 `aria-live="polite"`로 둡니다.
 * 정렬 드롭다운은 B(HOM-207)에서 오른쪽 자리에 채웁니다 — 지금은 공간만 비워둡니다.
 */
export function RoomListToolbar({ totalCount }: RoomListToolbarProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <p aria-live="polite" className="text-body-2 font-semibold text-grayscale-900">
        총 {totalCount}개
      </p>
      {/* 정렬 드롭다운 자리 — B(HOM-207) */}
    </div>
  );
}

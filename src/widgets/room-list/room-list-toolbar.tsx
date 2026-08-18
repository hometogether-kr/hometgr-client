import type { RoomSort } from "@/domains/room";
import { ROOM_SORT_LABEL, ROOM_SORTS } from "@/domains/room";
import { DropdownS } from "@/shared/ui/dropdown-s";

const SORT_OPTIONS = ROOM_SORTS.map((value) => ({ value, label: ROOM_SORT_LABEL[value] }));

interface RoomListToolbarProps {
  totalCount: number;
  sort: RoomSort;
  onSortChange: (sort: RoomSort) => void;
}

/**
 * 목록 상단 바 — 총 건수 + 정렬 드롭다운
 *
 * 총 건수는 필터 결과 변화를 스크린리더가 읽도록 `aria-live="polite"`로 둡니다.
 * 정렬은 칩형 `DropdownS`(우측 정렬)로, 선택 즉시 URL에 반영됩니다(모달이 아니므로
 * 초안 개념 없음 — 설계 §7-2).
 */
export function RoomListToolbar({ totalCount, sort, onSortChange }: RoomListToolbarProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <p aria-live="polite" className="text-body-2 font-semibold text-grayscale-900">
        총 {totalCount}개
      </p>
      <DropdownS
        options={SORT_OPTIONS}
        value={sort}
        onChange={onSortChange}
        align="end"
        aria-label="정렬 기준"
      />
    </div>
  );
}
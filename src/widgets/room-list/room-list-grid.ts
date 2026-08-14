/**
 * 매물 그리드 레이아웃 클래스
 *
 * 실제 목록과 스켈레톤이 반드시 같은 그리드를 써야 로딩 전환에서 레이아웃 시프트가
 * 생기지 않습니다. 한 곳에 두고 양쪽이 공유합니다.
 *
 * 열: 1(모바일) → 2(≥640) → 3(≥1024) → 4(≥1440), 열 간격 20px, 행 간격 48px (설계 §8).
 */
export const ROOM_GRID_CLASS =
  "grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4";

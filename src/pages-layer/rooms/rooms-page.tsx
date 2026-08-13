import { RoomList } from "@/widgets/room-list";
import { SiteLayout } from "@/widgets/site-layout";

/**
 * 매물 보기 페이지 조립 (서버 컴포넌트)
 *
 * `SiteLayout`의 `<main>`은 폭·패딩을 주지 않으므로 여기서 1520px 컨테이너와 반응형
 * 패딩을 직접 얹습니다(설계 §8: 좌우 20 → 40px, ≥1520 중앙 정렬, 4→3→2→1열).
 * 히어로 검색바(E/HOM-209)가 붙기 전까지 페이지 제목은 sr-only로 둡니다.
 */
export function RoomsPage() {
  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-[1520px] px-5 py-8 lg:px-10">
        {/* TODO(E/HOM-209): 히어로 검색바가 이 자리에 들어오며 <h1>을 대체합니다 */}
        <h1 className="sr-only">매물 보기</h1>
        <RoomList />
      </div>
    </SiteLayout>
  );
}

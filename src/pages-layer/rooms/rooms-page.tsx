import type { RoomFilter } from "@/features/filter-rooms";
import { RoomFilterBar } from "@/widgets/room-filter-bar";
import { RoomList } from "@/widgets/room-list";
import { RoomSearchHero } from "@/widgets/room-search-hero";
import { SiteLayout } from "@/widgets/site-layout";

interface RoomsPageProps {
  filter: RoomFilter;
}

/**
 * 매물 보기 페이지 조립 (서버 컴포넌트)
 *
 * `SiteLayout`의 `<main>`은 폭·패딩을 주지 않으므로 여기서 컨테이너와 반응형 패딩을 직접
 * 얹습니다(설계 §8). border-box라 좌우 패딩(20/40px)을 더해 max-w-[1600px]로 두면 그리드가
 * 1520px가 됩니다(QA A1). 히어로 → 칩 바 → 목록 순서로 조립합니다(QA §0-4).
 *
 * 서버가 파싱한 필터를 히어로·칩 바·목록에 함께 내려보냅니다 — RoomFilter는 전부 직렬화
 * 가능한 값이라 Server→Client 경계를 그대로 넘어갑니다(§6.0c). 페이지 제목(`<h1>`)은 히어로
 * 검색바가 담당하므로 별도 sr-only 제목을 두지 않습니다.
 */
export function RoomsPage({ filter }: RoomsPageProps) {
  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-[1600px] px-5 py-8 lg:px-10">
        <RoomSearchHero filter={filter} />
        <RoomFilterBar filter={filter} />
        <RoomList filter={filter} />
      </div>
    </SiteLayout>
  );
}
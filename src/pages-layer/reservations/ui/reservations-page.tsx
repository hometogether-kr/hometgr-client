import { getReservationTab, reservationFixtures, type ReservationTab } from "@/domains/reservation";
import { SiteLayout } from "@/widgets/site-layout";
import {
  ReservationList,
  ReservationTabs,
  type ReservationTabItem,
} from "@/widgets/reservation-list";

const PAGE_SIZE = 4;

const tabLabels: Record<ReservationTab, string> = {
  all: "전체",
  pending: "승인 대기",
  confirmed: "예약 확정",
  visited: "방문 완료",
  closed: "거절/취소",
};

export interface ReservationsPageProps {
  activeTab: ReservationTab;
  requestedPage: number;
}

export function ReservationsPage({ activeTab, requestedPage }: ReservationsPageProps) {
  const tabItems: ReservationTabItem[] = (Object.keys(tabLabels) as ReservationTab[]).map(
    (tab) => ({
      value: tab,
      label: tabLabels[tab],
      count:
        tab === "all"
          ? reservationFixtures.length
          : reservationFixtures.filter(
              (reservation) => getReservationTab(reservation.status) === tab,
            ).length,
    }),
  );
  const filteredReservations =
    activeTab === "all"
      ? reservationFixtures
      : reservationFixtures.filter(
          (reservation) => getReservationTab(reservation.status) === activeTab,
        );
  const totalPages = Math.max(1, Math.ceil(filteredReservations.length / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const visibleReservations = filteredReservations.slice(start, start + PAGE_SIZE);

  return (
    <SiteLayout>
      <div className="mx-auto flex w-full max-w-[1176px] flex-1 flex-col px-4 py-10 md:px-6 md:py-20">
        <header className="mb-8 md:mb-12">
          <h1 className="text-heading-1 font-bold text-grayscale-900 md:text-title-1">예약 관리</h1>
          <p className="mt-2 text-body-2 text-grayscale-500 md:text-body-1">
            신청한 방문 예약의 진행 상태와 일정을 확인해 보세요.
          </p>
        </header>
        <ReservationTabs activeTab={activeTab} items={tabItems} />
        <div className="mt-6 md:mt-8">
          <ReservationList
            reservations={visibleReservations}
            activeTab={activeTab}
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </div>
      </div>
    </SiteLayout>
  );
}

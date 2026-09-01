import type { ReservationCardViewModel, ReservationTab } from "@/domains/reservation";
import { ReservationCard } from "@/domains/reservation";

import {
  ReservationListEmpty,
  ReservationListError,
  ReservationListLoading,
} from "./reservation-list-state";
import { ReservationPagination } from "./reservation-pagination";

export type ReservationListState = "ready" | "loading" | "error";

export interface ReservationListProps {
  reservations: ReservationCardViewModel[];
  activeTab: ReservationTab;
  currentPage: number;
  totalPages: number;
  state?: ReservationListState;
}

export function ReservationList({
  reservations,
  activeTab,
  currentPage,
  totalPages,
  state = "ready",
}: ReservationListProps) {
  return (
    <section id="reservation-list-panel" role="tabpanel" className="space-y-8" aria-live="polite">
      {state === "loading" ? (
        <ReservationListLoading />
      ) : state === "error" ? (
        <ReservationListError />
      ) : reservations.length === 0 ? (
        <ReservationListEmpty />
      ) : (
        <div className="space-y-4">
          {reservations.map((reservation, index) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              eagerImage={index === 0}
            />
          ))}
        </div>
      )}
      {state === "ready" && reservations.length > 0 && (
        <ReservationPagination
          activeTab={activeTab}
          currentPage={currentPage}
          totalPages={totalPages}
        />
      )}
    </section>
  );
}

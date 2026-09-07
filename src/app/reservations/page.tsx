import type { Metadata } from "next";

import {
  normalizeReservationPage,
  normalizeReservationTab,
  ReservationsPage,
} from "@/pages-layer/reservations";

export const metadata: Metadata = {
  title: "예약 관리",
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Page({ searchParams }: PageProps) {
  const query = await searchParams;
  const activeTab = normalizeReservationTab(query.status);
  const requestedPage = normalizeReservationPage(query.page);

  return <ReservationsPage activeTab={activeTab} requestedPage={requestedPage} />;
}

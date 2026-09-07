import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getReservationDetailById } from "@/domains/reservation";
import { ReservationDetailPage } from "@/pages-layer/reservation-detail";

export const metadata: Metadata = {
  title: "예약 상세",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const reservation = getReservationDetailById(id);

  if (reservation === null) notFound();

  return <ReservationDetailPage reservation={reservation} />;
}

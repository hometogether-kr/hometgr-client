import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getReservationDetailById, getReservationDetailPresentation } from "@/domains/reservation";
import { VisitReviewPage } from "@/pages-layer/reservation-detail";

export const metadata: Metadata = {
  title: "방문 후기 작성",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const reservation = getReservationDetailById(id);

  if (reservation === null || getReservationDetailPresentation(reservation).tone !== "visited") {
    notFound();
  }

  return <VisitReviewPage reservation={reservation} />;
}

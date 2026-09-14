import type { Metadata } from "next";

import { ReservationDetailPage } from "@/pages-layer/reservation-detail";

export const metadata: Metadata = {
  title: "예약 상세",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <ReservationDetailPage reservationId={id} />;
}

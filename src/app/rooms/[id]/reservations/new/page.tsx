import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getRoomDetail } from "@/domains/listing/server";
import { VisitRequestPage } from "@/pages-layer/visit-request";

export const metadata: Metadata = {
  title: "방문 예약 신청",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const room = await getRoomDetail(id);

  if (room === null) notFound();

  return <VisitRequestPage room={room} />;
}

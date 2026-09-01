import type { Metadata } from "next";

import { VisitRequestPage } from "@/pages-layer/visit-request";

export const metadata: Metadata = {
  title: "방문 예약 신청",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <VisitRequestPage roomId={id} />;
}

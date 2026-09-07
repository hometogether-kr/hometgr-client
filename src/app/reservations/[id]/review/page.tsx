import type { Metadata } from "next";

import { VisitReviewPage } from "@/pages-layer/reservation-detail";

export const metadata: Metadata = {
  title: "방문 후기 작성",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <VisitReviewPage reservationId={id} />;
}

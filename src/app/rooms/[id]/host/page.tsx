import { notFound } from "next/navigation";

import { getRoomDetail } from "@/domains/listing/server";
import { ListingHostPage } from "@/pages-layer/listing-host";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const room = await getRoomDetail(id);

  if (room === null) notFound();

  return <ListingHostPage room={room} />;
}

import { notFound } from "next/navigation";

import { getRoomDetail } from "@/domains/listing/server";
import { parseRoomListReturnHref } from "@/features/filter-rooms";
import { ListingHostPage } from "@/pages-layer/listing-host";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Page({ params, searchParams }: PageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const room = await getRoomDetail(id);

  if (room === null) notFound();

  return <ListingHostPage room={room} returnHref={parseRoomListReturnHref(query.returnTo)} />;
}

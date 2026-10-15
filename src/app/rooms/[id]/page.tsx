import { notFound } from "next/navigation";

import { getRoomDetail } from "@/domains/listing/server";
import { parseRoomListReturnHref } from "@/features/filter-rooms";
import { getPreviewDetailNavigation, getRoomPreviewOptions } from "@/features/preview-rooms";
import { ListingDetailPage, PreviewListingDetailPage } from "@/pages-layer/listing-detail";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Page({ params, searchParams }: PageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const previewOptions = getRoomPreviewOptions(query);
  if (previewOptions) {
    return (
      <PreviewListingDetailPage
        key={JSON.stringify([id, previewOptions])}
        id={id}
        previewOptions={previewOptions}
        {...getPreviewDetailNavigation(query)}
      />
    );
  }
  if (id.startsWith("preview-room-")) notFound();
  const room = await getRoomDetail(id);

  if (room === null) notFound();

  return <ListingDetailPage room={room} returnHref={parseRoomListReturnHref(query.returnTo)} />;
}

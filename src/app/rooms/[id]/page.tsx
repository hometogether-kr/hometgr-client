import { getRoomDetail } from "@/domains/listing";
import { ListingDetailPage } from "@/pages-layer/listing-detail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const room = await getRoomDetail(id);

  return <ListingDetailPage room={room} />;
}

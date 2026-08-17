import { getRoomDetail } from "@/domains/listing";
import { ListingHostPage } from "@/pages-layer/listing-host";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const room = await getRoomDetail(id);

  return <ListingHostPage room={room} />;
}

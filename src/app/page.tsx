import { getRoomPreviewOptions } from "@/features/preview-rooms";
import { GuestHomePage } from "@/pages-layer/guest-home";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <GuestHomePage previewOptions={getRoomPreviewOptions(await searchParams)} />;
}

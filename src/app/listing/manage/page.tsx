import { z } from "zod";

import { LISTING_FILTERS } from "@/features/manage-listing";
import {
  ConnectedListingManagementList,
  ListingManagementShell,
} from "@/pages-layer/listing-management";

export const metadata = { title: "내 방 관리" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filter = z
    .enum(LISTING_FILTERS)
    .catch("전체")
    .parse((await searchParams).filter);
  return (
    <ListingManagementShell>
      <ConnectedListingManagementList filter={filter} />
    </ListingManagementShell>
  );
}

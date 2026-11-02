import { Suspense } from "react";

import { ConnectedListingEditor, ListingManagementShell } from "@/pages-layer/listing-management";

export const metadata = { title: "매물 수정" };
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <ListingManagementShell editing>
      <Suspense>
        <ConnectedListingEditor roomId={id} />
      </Suspense>
    </ListingManagementShell>
  );
}

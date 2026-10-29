import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ListingManagementPreview } from "@/pages-layer/listing-management";

export default function Page() {
  if (process.env.NODE_ENV !== "development") notFound();
  return (
    <Suspense>
      <ListingManagementPreview />
    </Suspense>
  );
}

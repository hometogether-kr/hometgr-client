import { Suspense } from "react";

import { ListingStep2Connected } from "@/pages-layer/listing-step-2-place";
import { ListingDraftState } from "@/widgets/listing-step-layout";

export default function Page() {
  return (
    <Suspense fallback={<ListingDraftState status="loading" />}>
      <ListingStep2Connected />
    </Suspense>
  );
}

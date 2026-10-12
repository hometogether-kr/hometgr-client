import { Suspense } from "react";

import { ListingStep3Connected } from "@/pages-layer/listing-step-3-detail";
import { ListingDraftState } from "@/widgets/listing-step-layout";

export default function Page() {
  return (
    <Suspense fallback={<ListingDraftState status="loading" />}>
      <ListingStep3Connected />
    </Suspense>
  );
}

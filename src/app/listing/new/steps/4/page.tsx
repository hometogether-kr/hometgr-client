import { Suspense } from "react";

import { ListingStep4Connected } from "@/pages-layer/listing-step-4-guest-space";
import { ListingDraftState } from "@/widgets/listing-step-layout";

export default function Page() {
  return (
    <Suspense fallback={<ListingDraftState status="loading" />}>
      <ListingStep4Connected />
    </Suspense>
  );
}

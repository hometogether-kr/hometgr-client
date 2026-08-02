"use client";

import { Suspense } from "react";
import { useDraftStepFlow } from "@/features/save-listing-draft";
import { ListingStep1Page } from "@/pages-layer/listing-step-1-registrant";

function Step1() {
  const { draft, isSaving, saveAndGoNext, goPrev } = useDraftStepFlow(2);

  return (
    <ListingStep1Page
      key={draft?.draftId}
      initialRelationship={draft?.data.registrant?.registrantRelationship ?? null}
      isSaving={isSaving}
      onPrev={goPrev}
      onNext={(registrantRelationship) => saveAndGoNext({ registrantRelationship })}
    />
  );
}

export default function Page() {
  /* useSearchParams로 초안 ID를 읽으므로 Suspense 경계가 필요합니다. */
  return (
    <Suspense fallback={null}>
      <Step1 />
    </Suspense>
  );
}

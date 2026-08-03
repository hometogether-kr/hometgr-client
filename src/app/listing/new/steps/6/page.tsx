"use client";

import { Suspense } from "react";

import { useDraftStepFlow } from "@/features/save-listing-draft";
import {
  ListingStep6Page,
  type ListingStep6Values,
} from "@/pages-layer/listing-step-6-house-rules";

function Step6() {
  const { draft, isSaving, saveAndGoNext, goPrev } = useDraftStepFlow(7);
  const preferences = draft?.data.preferences;

  const handleNext = ({ additionalGuidance, ...values }: ListingStep6Values) =>
    saveAndGoNext({
      ...values,
      ...(additionalGuidance ? { additionalGuidance } : {}),
    });

  return (
    <ListingStep6Page
      key={draft?.draftId}
      initialValues={{
        visitorPolicy: preferences?.visitorPolicy ?? null,
        petAllowed: preferences?.petAllowed ?? null,
        smokingPreference: preferences?.smokingPreference ?? null,
        preferredGender: preferences?.preferredGender ?? null,
        roomCapacity: preferences?.roomCapacity ?? null,
        interactionPreference: preferences?.interactionPreference ?? null,
        additionalGuidance: preferences?.additionalGuidance ?? "",
      }}
      isSaving={isSaving}
      onPrev={goPrev}
      onNext={(values) => void handleNext(values)}
    />
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Step6 />
    </Suspense>
  );
}

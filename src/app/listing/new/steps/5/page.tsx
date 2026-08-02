"use client";

import { Suspense } from "react";
import { useDraftStepFlow } from "@/features/save-listing-draft";
import {
  ListingStep5Page,
  type ListingStep5Values,
} from "@/pages-layer/listing-step-5-shared-space";

function Step5() {
  const { draft, isSaving, saveAndGoNext, goPrev } = useDraftStepFlow(6);
  const commonFacilities = draft?.data.commonFacilities;

  const handleNext = ({ bathroomDescription, ...values }: ListingStep5Values) =>
    saveAndGoNext({
      ...values,
      ...(bathroomDescription ? { bathroomDescription } : {}),
    });

  return (
    <ListingStep5Page
      key={draft?.draftId}
      initialValues={{
        kitchenUsagePolicy: commonFacilities?.kitchenUsagePolicy ?? null,
        livingRoomUsagePolicy: commonFacilities?.livingRoomUsagePolicy ?? null,
        washingMachineUsagePolicy: commonFacilities?.washingMachineUsagePolicy ?? null,
        bathroomUsageType: commonFacilities?.bathroomUsageType ?? null,
        bathroomDescription: commonFacilities?.bathroomDescription ?? "",
      }}
      isSaving={isSaving}
      onPrev={goPrev}
      onNext={handleNext}
    />
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Step5 />
    </Suspense>
  );
}

"use client";

import { Suspense } from "react";

import { useDraftStepFlow } from "@/features/save-listing-draft";
import {
  ListingStep9Page,
  type ListingStep9Values,
} from "@/pages-layer/listing-step-9-description";

function Step9() {
  const { draft, isSaving, saveAndGoNext, goPrev } = useDraftStepFlow(10);
  const descriptions = draft?.data.descriptions;

  // 모두 선택 입력이라, 비어 있으면 키를 빼서 "입력 안 함"으로 저장합니다.
  const handleNext = (values: ListingStep9Values) =>
    saveAndGoNext({
      ...(values.roomDescription ? { roomDescription: values.roomDescription } : {}),
      ...(values.currentResidentsDescription
        ? { currentResidentsDescription: values.currentResidentsDescription }
        : {}),
      ...(values.precautions ? { precautions: values.precautions } : {}),
    });

  return (
    <ListingStep9Page
      key={draft?.draftId}
      initialValues={{
        roomDescription: descriptions?.roomDescription ?? "",
        currentResidentsDescription: descriptions?.currentResidentsDescription ?? "",
        precautions: descriptions?.precautions ?? "",
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
      <Step9 />
    </Suspense>
  );
}

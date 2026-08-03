"use client";

import { Suspense } from "react";

import { useDraftStepFlow } from "@/features/save-listing-draft";
import {
  ListingStep4Page,
  type ListingStep4Values,
} from "@/pages-layer/listing-step-4-guest-space";

function Step4() {
  const { draft, isSaving, saveAndGoNext, goPrev } = useDraftStepFlow(5);
  const privateSpace = draft?.data.privateSpace;

  const handleNext = ({ rentalSpaceTypeOther, ...values }: ListingStep4Values) =>
    // 기타가 아니면 설명 키 자체를 빼야 서버 검증을 통과합니다.
    saveAndGoNext({
      ...values,
      ...(values.rentalSpaceType === "other" ? { rentalSpaceTypeOther } : {}),
    });

  return (
    <ListingStep4Page
      key={draft?.draftId}
      initialValues={{
        rentalSpaceType: privateSpace?.rentalSpaceType ?? null,
        rentalSpaceTypeOther: privateSpace?.rentalSpaceTypeOther ?? "",
        privateRoomSize: privateSpace?.privateRoomSize ?? null,
        privateRoomOptions: [...(privateSpace?.privateRoomOptions ?? [])],
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
      <Step4 />
    </Suspense>
  );
}

"use client";

import { Suspense } from "react";

import { useDraftStepFlow } from "@/features/save-listing-draft";
import { ListingStep3Page, type ListingStep3Values } from "@/pages-layer/listing-step-3-detail";

function Step3() {
  const { draft, isSaving, saveAndGoNext, goPrev } = useDraftStepFlow(4);
  const household = draft?.data.household;

  // 주차가 불가능하면 주차 유형·설명 키 자체를 빼야 서버 검증을 통과합니다.
  const handleNext = ({ parkingType, parkingDescription, ...values }: ListingStep3Values) =>
    saveAndGoNext({
      ...values,
      ...(parkingType ? { parkingType } : {}),
      ...(parkingDescription ? { parkingDescription } : {}),
    });

  return (
    <ListingStep3Page
      key={draft?.draftId}
      initialValues={{
        areaRange: household?.areaRange ?? null,
        totalRoomCount: household?.totalRoomCount ?? 0,
        residentCount: household?.residentCount ?? 0,
        residentType: household?.residentType ?? null,
        residentGenderComposition: household?.residentGenderComposition ?? null,
        elevatorAvailable: household?.elevatorAvailable ?? null,
        parkingAvailable: household?.parkingAvailable ?? null,
        parkingType: household?.parkingType ?? null,
        parkingDescription: household?.parkingDescription ?? "",
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
      <Step3 />
    </Suspense>
  );
}

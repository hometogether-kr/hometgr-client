"use client";

import { Suspense } from "react";

import { deriveAddressRegion, useDraftStepFlow } from "@/features/save-listing-draft";
import { ListingStep2Page, type ListingStep2Values } from "@/pages-layer/listing-step-2-place";
import { useToast } from "@/shared/ui/toast";

function Step2() {
  const { draft, isSaving, saveAndGoNext, goPrev } = useDraftStepFlow(3);
  const { showToast } = useToast();
  const location = draft?.data.location;

  const handleNext = (values: ListingStep2Values) => {
    if (!values.buildingType) {
      showToast("건물 유형을 선택해주세요.", { variant: "error" });
      return;
    }

    const hasExactAddress = values.addressRoad !== "" && values.addressDetail !== "";
    /*
     * 지역은 주소 검색 결과(시·도 + 시·군·구)를 그대로 씁니다. 예전 초안처럼 값이
     * 없을 때만 도로명 주소 앞부분에서 유도합니다.
     */
    const addressRegion = values.addressRegion || deriveAddressRegion(values.addressRoad);

    // 조건부 필드는 빈 문자열이 아니라 키 자체를 빼야 서버 검증을 통과합니다.
    return saveAndGoNext({
      ...(hasExactAddress
        ? {
            addressRoad: values.addressRoad,
            addressDetail: values.addressDetail,
            ...(addressRegion ? { addressRegion } : {}),
          }
        : {}),
      ...(values.approximateLocation ? { approximateLocation: values.approximateLocation } : {}),
      buildingType: values.buildingType,
      ...(values.buildingType === "other" ? { buildingTypeOther: values.buildingTypeOther } : {}),
    });
  };

  return (
    <ListingStep2Page
      key={draft?.draftId}
      initialValues={{
        addressRoad: location?.addressRoad ?? "",
        addressDetail: location?.addressDetail ?? "",
        addressRegion: location?.addressRegion ?? "",
        approximateLocation: location?.approximateLocation ?? "",
        buildingType: location?.buildingType ?? null,
        buildingTypeOther: location?.buildingTypeOther ?? "",
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
      <Step2 />
    </Suspense>
  );
}

"use client";

import { Suspense } from "react";

import {
  parseKrwAmount,
  parseStayMonths,
  toDateInputValue,
  toKstIsoString,
  useDraftStepFlow,
} from "@/features/save-listing-draft";
import { ListingStep7Page, type ListingStep7Values } from "@/pages-layer/listing-step-7-contract";
import { useToast } from "@/shared/ui/toast";

function Step7() {
  const { draft, isSaving, saveAndGoNext, goPrev } = useDraftStepFlow(8);
  const { showToast } = useToast();
  const pricing = draft?.data.pricing;

  const handleNext = ({ moveInAvailableOn, ...values }: ListingStep7Values) => {
    // API가 시간대 suffix를 요구해 날짜를 한국 시간 기준 ISO로 바꿔 보냅니다.
    const moveInAvailableAt = toKstIsoString(moveInAvailableOn);

    if (!moveInAvailableAt) {
      showToast("입주 가능일을 다시 선택해주세요.", { variant: "error" });
      return;
    }

    return saveAndGoNext({ ...values, moveInAvailableAt });
  };

  return (
    <ListingStep7Page
      key={draft?.draftId}
      initialValues={{
        monthlyRent: pricing ? String(pricing.monthlyRentKrw) : "",
        deposit: pricing ? String(pricing.depositKrw) : "",
        maintenanceFee: pricing ? String(pricing.maintenanceFeeKrw) : "",
        moveInAvailableOn: pricing ? toDateInputValue(pricing.moveInAvailableAt) : "",
        minStay: pricing ? `${pricing.minStayMonths}개월` : "",
      }}
      isSaving={isSaving}
      parseAmount={parseKrwAmount}
      parsePeriod={parseStayMonths}
      onPrev={goPrev}
      onNext={(values) => void handleNext(values)}
    />
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Step7 />
    </Suspense>
  );
}

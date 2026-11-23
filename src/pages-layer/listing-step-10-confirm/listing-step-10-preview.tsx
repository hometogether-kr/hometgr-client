"use client";

import { useToast } from "@/shared/ui/toast";

import { ListingStep10Page } from "./listing-step-10-page";

export function ListingStep10Preview() {
  const { showToast } = useToast();

  return (
    <ListingStep10Page
      initialValues={{
        contactName: "김홈투",
        contactPhone: "01012345678",
        preferredContactTime: "morning",
        preferredContactMethod: "phoneCall",
      }}
      onSubmit={() => showToast("필수 확인과 동의가 모두 완료되었습니다.")}
    />
  );
}

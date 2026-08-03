"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { useListingDraft } from "@/domains/listing-draft";
import { formatKoreanPhone, useSaveDraftStep, useSubmitDraft } from "@/features/save-listing-draft";
import { ListingStep10Page, type ListingStep10Values } from "@/pages-layer/listing-step-10-confirm";
import { ApiError } from "@/shared/api";
import { ROUTES } from "@/shared/config";
import { useToast } from "@/shared/ui/toast";

function Step10() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const draftId = searchParams.get("draftId");
  const { draft } = useListingDraft(draftId);
  const { saveStep, isSaving } = useSaveDraftStep(draftId ?? "");
  const { submitDraft, isSubmitting } = useSubmitDraft(draftId ?? "");

  const contact = draft?.data.contact;

  /*
   * 연락처 저장과 제출은 서로 다른 endpoint라, 저장 응답의 새 version으로 이어서
   * 제출합니다. 저장이 실패하면 제출까지 가지 않습니다.
   */
  const handleSubmit = async (values: ListingStep10Values) => {
    const contactPhone = formatKoreanPhone(values.contactPhone);

    if (!draftId || !draft || !contactPhone) {
      showToast("등록 정보를 불러오지 못했습니다. 새로고침 후 다시 시도해주세요.", {
        variant: "error",
      });
      return;
    }

    try {
      const saved = await saveStep({
        step: 11,
        expectedVersion: draft.version,
        data: { ...values, contactPhone },
      });

      await submitDraft(saved.version);
      router.push(ROUTES.listing.complete);
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : "등록 요청에 실패했습니다.", {
        variant: "error",
      });
    }
  };

  return (
    <ListingStep10Page
      key={draft?.draftId}
      initialValues={{
        contactName: contact?.contactName ?? "",
        contactPhone: contact?.contactPhone ?? "",
        preferredContactTime: contact?.preferredContactTime ?? null,
        preferredContactMethod: contact?.preferredContactMethod ?? null,
      }}
      isSubmitting={isSaving || isSubmitting}
      validatePhone={(phone) => formatKoreanPhone(phone) !== null}
      onPrev={() => router.push(ROUTES.listing.step(9, draftId ?? undefined))}
      onSubmit={(values) => void handleSubmit(values)}
    />
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Step10 />
    </Suspense>
  );
}

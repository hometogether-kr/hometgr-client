"use client";

import { useRouter } from "next/navigation";

import { useCreateDraft } from "@/features/save-listing-draft";
import { ListingChecklistPage } from "@/pages-layer/listing-checklist";
import { ApiError } from "@/shared/api";
import { ROUTES } from "@/shared/config";
import { useToast } from "@/shared/ui/toast";

export default function Page() {
  const router = useRouter();
  const { createDraft, isCreating } = useCreateDraft();
  const { showToast } = useToast();

  /*
   * 초안은 1단계로 들어가기 직전에 만듭니다. 체크리스트만 보고 이탈한 사용자의
   * 빈 초안이 목록에 쌓이지 않게 하기 위해서입니다.
   */
  const handleStart = async () => {
    try {
      const draft = await createDraft();
      router.push(ROUTES.listing.step(1, draft.draftId));
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "등록을 시작하지 못했습니다.";
      showToast(message, { variant: "error" });
    }
  };

  return (
    <ListingChecklistPage
      onStart={() => void handleStart()}
      isStarting={isCreating}
      onBack={() => router.push(ROUTES.listing.start)}
    />
  );
}

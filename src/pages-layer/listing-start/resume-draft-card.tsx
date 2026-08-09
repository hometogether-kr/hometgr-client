"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import {
  daysUntilExpiry,
  findResumableDraft,
  type ListingDraftSummary,
  useListingDrafts,
} from "@/domains/listing-draft";
import { ROUTES } from "@/shared/config";
import { useToast } from "@/shared/ui/toast";

import { StartButtonCard } from "./start-card";

function toProgressDescription(draft: ListingDraftSummary | null): string {
  if (!draft) return "이전에 작성한 내용을 이어서 작성";

  const remainingDays = daysUntilExpiry(draft);
  const savedSteps = draft.completedSteps.length;
  const expiryNotice = remainingDays <= 1 ? "오늘 만료" : `${remainingDays}일 뒤 만료`;

  return `${savedSteps}단계까지 작성했어요 · ${expiryNotice}`;
}

export interface ResumeDraftCardProps {
  illustration: ReactNode;
}

/**
 * 임시저장 이어쓰기
 *
 * 마지막으로 저장한 초안의 다음 단계로 바로 이동합니다. 각 단계 화면이 초안 ID로
 * 저장된 값을 불러오므로, 이동만 시키면 이어쓰기가 완성됩니다.
 */
export function ResumeDraftCard({ illustration }: ResumeDraftCardProps) {
  const router = useRouter();
  const { drafts, isLoading, error } = useListingDrafts();
  const { showToast } = useToast();

  const resumableDraft = findResumableDraft(drafts);
  const disabled = isLoading || Boolean(error);

  const handleResume = () => {
    if (error) {
      showToast("임시저장을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.", { variant: "error" });
      return;
    }
    if (!resumableDraft) {
      showToast("이어서 작성할 임시저장이 없어요.", { variant: "error" });
      return;
    }

    // 모든 단계를 채운 초안은 마지막 단계에서 확인 후 제출하도록 보냅니다.
    const targetStep = resumableDraft.nextStep ?? 10;
    router.push(ROUTES.listing.step(targetStep, resumableDraft.draftId));
  };

  return (
    <StartButtonCard
      title="임시저장 이어쓰기"
      description={toProgressDescription(resumableDraft)}
      actionLabel="이어서 작성하기"
      illustration={illustration}
      disabled={disabled}
      onClick={handleResume}
    />
  );
}

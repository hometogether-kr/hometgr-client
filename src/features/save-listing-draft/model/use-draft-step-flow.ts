"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  type ApiStep,
  type ListingDraft,
  toScreenStep,
  useListingDraft,
} from "@/domains/listing-draft";
import { ApiError } from "@/shared/api";
import { ROUTES } from "@/shared/config";
import { useToast } from "@/shared/ui/toast";
import type { SaveStepCommand, StepDataMap } from "./step-command.schema";
import { useSaveDraftStep } from "./use-save-draft-step";

export interface DraftStepFlow<TStep extends keyof StepDataMap> {
  draftId: string | null;
  draft: ListingDraft | null;
  isLoading: boolean;
  isSaving: boolean;
  /** 저장에 성공하면 다음 단계로 이동합니다. 실패하면 현재 화면에 머뭅니다. */
  saveAndGoNext: (data: StepDataMap[TStep]) => Promise<void>;
  goPrev: () => void;
}

/**
 * 단계 화면의 초안 연결
 *
 * 초안 ID는 URL에서 읽어 새로고침·뒤로가기에도 같은 초안을 이어갑니다.
 * 저장 성공 응답에 최신 `version`이 담겨 캐시가 갱신되므로, 다음 단계는 재조회 없이
 * 바로 저장할 수 있습니다.
 */
export function useDraftStepFlow<TStep extends ApiStep & keyof StepDataMap>(
  apiStep: TStep,
): DraftStepFlow<TStep> {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const draftId = searchParams.get("draftId");
  const { draft, isLoading } = useListingDraft(draftId);
  const { saveStep, isSaving } = useSaveDraftStep(draftId ?? "");

  const screenStep = toScreenStep(apiStep);

  const goPrev = () => {
    router.push(
      screenStep === 1
        ? ROUTES.listing.checklist
        : ROUTES.listing.step(screenStep - 1, draftId ?? undefined),
    );
  };

  const saveAndGoNext = async (data: StepDataMap[TStep]) => {
    if (!draftId || !draft) {
      showToast("등록 정보를 불러오지 못했습니다. 처음부터 다시 시작해주세요.", {
        variant: "error",
      });
      return;
    }

    /*
     * step과 data는 같은 단계에서 온 값이지만, TypeScript가 유니온의 두 멤버를
     * 서로 연결해 좁히지 못해 조립된 커맨드를 한 번 단언합니다.
     */
    const command = { step: apiStep, expectedVersion: draft.version, data } as SaveStepCommand;

    try {
      await saveStep(command);
      router.push(ROUTES.listing.step(screenStep + 1, draftId));
    } catch (error) {
      if (error instanceof ApiError && error.kind === "conflict") {
        showToast("다른 곳에서 먼저 저장되었습니다. 새로고침 후 다시 시도해주세요.", {
          variant: "error",
        });
        return;
      }

      showToast(error instanceof ApiError ? error.message : "저장하지 못했습니다.", {
        variant: "error",
      });
    }
  };

  return { draftId, draft, isLoading, isSaving, saveAndGoNext, goPrev };
}

"use client";

import { useState } from "react";
import {
  REGISTRANT_RELATIONSHIP_OPTIONS,
  type RegistrantRelationship,
} from "@/domains/listing-draft";
import { BtnCard } from "@/shared/ui/btn-card";
import { InfoBox } from "@/shared/ui/info-box";
import { Toast, ToastViewport } from "@/shared/ui/toast";
import { ListingStepLayout } from "@/widgets/listing-step-layout";

export interface ListingStep1PageProps {
  /** 초안에 저장돼 있던 값 — 이어쓰기로 들어왔을 때 복원합니다. */
  initialRelationship?: RegistrantRelationship | null;
  onPrev?: () => void;
  onNext?: (registrantRelationship: RegistrantRelationship) => void;
  isSaving?: boolean;
}

/**
 * 1단계 · 등록자 정보 (Figma: 호스트 매물 등록 메인, node 420:6674 · 424:11785 · 424:12064)
 *
 * - 미선택 상태에서 "다음으로" → 하단 에러 문구 + 상단 에러 토스트
 */
export function ListingStep1Page({
  initialRelationship = null,
  onPrev,
  onNext,
  isSaving = false,
}: ListingStep1PageProps) {
  const [relationship, setRelationship] = useState<RegistrantRelationship | null>(
    initialRelationship,
  );
  const [showError, setShowError] = useState(false);

  const handleNext = () => {
    if (!relationship) {
      setShowError(true);
      return;
    }
    setShowError(false);
    onNext?.(relationship);
  };

  const handleSelect = (value: RegistrantRelationship) => {
    setRelationship(value);
    setShowError(false);
  };

  return (
    <>
      {showError && (
        <ToastViewport>
          <Toast variant="error">두 항목 중 최소 1가지는 선택해주세요.</Toast>
        </ToastViewport>
      )}
      <ListingStepLayout
        step={1}
        title="등록하고 계신분은 누구인가요?"
        description="소유자 본인 또는 가족 대리 등록만 허용하고, 확인 연락을 통해 검수 리스크를 줄입니다."
        onPrev={onPrev}
        onNext={handleNext}
        nextDisabled={isSaving}
        autoSaving={isSaving}
      >
        <div className="flex w-full flex-col gap-4">
          <div className="flex w-full flex-col gap-4">
            {REGISTRANT_RELATIONSHIP_OPTIONS.map((option) => (
              <BtnCard
                key={option.value}
                name="registrant"
                value={option.value}
                title={option.label}
                description={option.description}
                checked={relationship === option.value}
                onChange={() => handleSelect(option.value)}
              />
            ))}
            {showError && (
              <p className="pl-1 pt-3 text-[13px] font-medium leading-[1.4] text-system-error">
                필수 항목입니다.
              </p>
            )}
          </div>
          <InfoBox className="max-w-[770px]">
            공인 중개사, 중개업자는 홈투게더 호스트 등록이 불가능합니다.
          </InfoBox>
        </div>
      </ListingStepLayout>
    </>
  );
}

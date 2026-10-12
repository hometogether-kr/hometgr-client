"use client";

import {
  DraftFormNotice,
  householdFormSchema,
  restoreDraftForm,
  useDraftFormSession,
} from "@/features/save-listing-draft";
import { ListingDraftState } from "@/widgets/listing-step-layout";

import { ListingStep3Page } from "./listing-step-3-page";

export function ListingStep3Connected() {
  const session = useDraftFormSession(4);
  if (session.isLoading) return <ListingDraftState status="loading" />;
  if (!session.draft) return <ListingDraftState status="error" />;
  const { values, warnings } = restoreDraftForm(session.draft, 4, householdFormSchema);
  return (
    <ListingStep3Page
      key={session.draft.draftId}
      initialValues={values}
      onChange={session.onChange}
      isSaving={session.isSaving}
      onPrev={() => void session.goPrev()}
      onNext={({ parkingType, parkingDescription, ...input }) =>
        void session.saveAndGoNext({
          ...input,
          ...(input.parkingAvailable && parkingType ? { parkingType } : {}),
          ...(input.parkingAvailable && parkingDescription ? { parkingDescription } : {}),
        })
      }
      notice={
        <DraftFormNotice
          status={session.status}
          error={
            session.saveError ??
            (session.loadError
              ? "최신 초안을 확인하지 못했습니다. 입력 내용은 현재 화면에 유지됩니다."
              : null)
          }
          warnings={warnings}
        />
      }
    />
  );
}

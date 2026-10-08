"use client";

import {
  DraftFormNotice,
  privateSpaceFormSchema,
  restoreDraftForm,
  useDraftFormSession,
} from "@/features/save-listing-draft";
import { ListingDraftState } from "@/widgets/listing-step-layout";

import { ListingStep4Page } from "./listing-step-4-page";

export function ListingStep4Connected() {
  const session = useDraftFormSession(5);
  if (session.isLoading) return <ListingDraftState status="loading" />;
  if (!session.draft) return <ListingDraftState status="error" />;
  const { values, warnings } = restoreDraftForm(session.draft, 5, privateSpaceFormSchema);
  return (
    <ListingStep4Page
      key={session.draft.draftId}
      initialValues={values}
      onChange={session.onChange}
      isSaving={session.isSaving}
      onPrev={() => void session.goPrev()}
      onNext={({ rentalSpaceTypeOther, ...input }) =>
        void session.saveAndGoNext({
          ...input,
          ...(input.rentalSpaceType === "other" ? { rentalSpaceTypeOther } : {}),
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

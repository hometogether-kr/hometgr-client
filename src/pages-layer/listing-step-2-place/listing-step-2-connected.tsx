"use client";

import {
  DraftFormNotice,
  locationFormSchema,
  restoreDraftForm,
  toLocationInput,
  useDraftFormSession,
} from "@/features/save-listing-draft";
import { ListingDraftState } from "@/widgets/listing-step-layout";

import { ListingStep2Page } from "./listing-step-2-page";

export function ListingStep2Connected() {
  const session = useDraftFormSession(3);
  if (session.isLoading) return <ListingDraftState status="loading" />;
  if (!session.draft) return <ListingDraftState status="error" />;
  const { values, warnings } = restoreDraftForm(session.draft, 3, locationFormSchema);
  return (
    <ListingStep2Page
      key={session.draft.draftId}
      initialValues={values}
      onChange={session.onChange}
      isSaving={session.isSaving}
      onPrev={() => void session.goPrev()}
      onNext={(input) => void session.saveAndGoNext(toLocationInput(input))}
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

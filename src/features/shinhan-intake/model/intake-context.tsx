"use client";

import { createContext, type ReactNode, useContext, useState } from "react";

import {
  createShinhanDraft,
  type ShinhanApplicationType,
  type ShinhanIntakeDraft,
} from "./intake-draft";

export const SHINHAN_INTAKE_PREVIEW_PATH = "/shinhan/dev/intake";

interface PrivacyReturnTarget {
  pathname: typeof SHINHAN_INTAKE_PREVIEW_PATH;
  applicationType: ShinhanApplicationType;
}

interface IntakeContextValue {
  draft: ShinhanIntakeDraft | null;
  privacyReturnTarget: PrivacyReturnTarget | null;
  startDraft: (applicationType: ShinhanApplicationType) => void;
  updateDraft: (update: (draft: ShinhanIntakeDraft) => ShinhanIntakeDraft) => void;
  rememberPrivacyReturn: () => void;
}

const IntakeContext = createContext<IntakeContextValue | null>(null);

export function ShinhanIntakeProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<ShinhanIntakeDraft | null>(null);
  const [privacyReturnTarget, setPrivacyReturnTarget] = useState<PrivacyReturnTarget | null>(null);

  function startDraft(applicationType: ShinhanApplicationType) {
    setDraft(createShinhanDraft(applicationType));
    // 푸터처럼 전문 보기 액션을 거치지 않는 진입도 현재 초안으로 복귀한다.
    setPrivacyReturnTarget({ pathname: SHINHAN_INTAKE_PREVIEW_PATH, applicationType });
  }

  function updateDraft(update: (current: ShinhanIntakeDraft) => ShinhanIntakeDraft) {
    setDraft((current) => (current ? update(current) : current));
  }

  function rememberPrivacyReturn() {
    if (!draft) return;
    setPrivacyReturnTarget({
      pathname: SHINHAN_INTAKE_PREVIEW_PATH,
      applicationType: draft.applicationType,
    });
  }

  return (
    <IntakeContext
      value={{ draft, privacyReturnTarget, startDraft, updateDraft, rememberPrivacyReturn }}
    >
      {children}
    </IntakeContext>
  );
}

export function useShinhanIntake() {
  const context = useContext(IntakeContext);
  if (!context) throw new Error("ShinhanIntakeProvider is required.");
  return context;
}

"use client";

import { usePathname } from "next/navigation";
import { createContext, type ReactNode, useCallback, useContext, useState } from "react";

import {
  SHINHAN_HOST_ESTIMATE_PATH,
  SHINHAN_HOST_REGISTRATION_PATH,
  SHINHAN_INTAKE_PREVIEW_PATH,
  type ShinhanDraftPath,
} from "../config/routes";
import {
  createShinhanDraft,
  type ShinhanApplicationType,
  type ShinhanIntakeDraft,
} from "./intake-draft";

interface PrivacyReturnTarget {
  pathname: ShinhanDraftPath;
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

interface IntakeSession {
  draft: ShinhanIntakeDraft | null;
  privacyReturnTarget: PrivacyReturnTarget | null;
}

function createSession(
  applicationType: ShinhanApplicationType,
  pathname: ShinhanDraftPath,
): IntakeSession {
  const draft = createShinhanDraft(applicationType);
  if (
    applicationType === "HOST_ESTIMATE" &&
    draft.applicationType === "HOST_ESTIMATE" &&
    pathname === SHINHAN_HOST_ESTIMATE_PATH
  ) {
    draft.values.furniture = { bed: "NONE", desk: "NONE", chair: "NONE", wardrobe: "NONE" };
  }
  return { draft, privacyReturnTarget: { pathname, applicationType } };
}

export function ShinhanIntakeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [session, setSession] = useState<IntakeSession>({ draft: null, privacyReturnTarget: null });
  let currentSession = session;
  const applicationType =
    pathname === SHINHAN_HOST_ESTIMATE_PATH
      ? "HOST_ESTIMATE"
      : pathname === SHINHAN_HOST_REGISTRATION_PATH
        ? "HOST_REGISTRATION"
        : null;

  // 같은 layout의 전문 왕복은 유지하고, 다른 작성 화면에 진입할 때만 새 초안을 만든다.
  // 자식이 이전 유형의 상태로 한 번 렌더링되는 effect 초기화를 피한다.
  if (
    applicationType &&
    (session.privacyReturnTarget?.pathname !== pathname ||
      session.draft?.applicationType !== applicationType)
  ) {
    currentSession = createSession(
      applicationType,
      applicationType === "HOST_ESTIMATE"
        ? SHINHAN_HOST_ESTIMATE_PATH
        : SHINHAN_HOST_REGISTRATION_PATH,
    );
    setSession(currentSession);
  } else if (
    pathname === SHINHAN_INTAKE_PREVIEW_PATH &&
    session.privacyReturnTarget &&
    session.privacyReturnTarget.pathname !== pathname
  ) {
    currentSession = { draft: null, privacyReturnTarget: null };
    setSession(currentSession);
  }
  const { draft, privacyReturnTarget } = currentSession;

  function startDraft(applicationType: ShinhanApplicationType) {
    setSession(createSession(applicationType, SHINHAN_INTAKE_PREVIEW_PATH));
  }

  const updateDraft = useCallback((update: (current: ShinhanIntakeDraft) => ShinhanIntakeDraft) => {
    setSession((current) =>
      current.draft ? { ...current, draft: update(current.draft) } : current,
    );
  }, []);

  function rememberPrivacyReturn() {
    // 초안 시작 때 복귀 위치를 기록하므로 본문·푸터 진입이 같은 경로를 사용한다.
    if (!draft || privacyReturnTarget) return;
    setSession({
      draft,
      privacyReturnTarget: {
        pathname: SHINHAN_INTAKE_PREVIEW_PATH,
        applicationType: draft.applicationType,
      },
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

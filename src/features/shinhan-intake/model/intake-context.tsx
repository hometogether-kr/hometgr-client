"use client";

import { usePathname } from "next/navigation";
import { createContext, type ReactNode, useCallback, useContext, useState } from "react";

import {
  SHINHAN_GUEST_BUDGET_PATH,
  SHINHAN_GUEST_DEMAND_PATH,
  SHINHAN_GUEST_FOLLOWUP_PATH,
  SHINHAN_HOST_ESTIMATE_PATH,
  SHINHAN_HOST_REGISTRATION_PATH,
  SHINHAN_INTAKE_PREVIEW_PATH,
  type ShinhanDraftPath,
} from "../config/routes";
import { createGuestFollowupExample, type GuestFollowupExample } from "./guest-followup";
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
  guestFollowup: GuestFollowupExample | null;
  startGuestFollowup: () => boolean;
  updateGuestFollowup: (update: (example: GuestFollowupExample) => GuestFollowupExample) => void;
  startDraft: (applicationType: ShinhanApplicationType) => void;
  startGuestDraft: (
    applicationType: "GUEST_BUDGET" | "GUEST_DEMAND",
    desiredRegionRaw?: string,
  ) => void;
  updateDraft: (update: (draft: ShinhanIntakeDraft) => ShinhanIntakeDraft) => void;
  rememberPrivacyReturn: () => void;
}

const applicationRoutes = [
  { pathname: SHINHAN_HOST_ESTIMATE_PATH, applicationType: "HOST_ESTIMATE" },
  { pathname: SHINHAN_HOST_REGISTRATION_PATH, applicationType: "HOST_REGISTRATION" },
  { pathname: SHINHAN_GUEST_BUDGET_PATH, applicationType: "GUEST_BUDGET" },
  { pathname: SHINHAN_GUEST_DEMAND_PATH, applicationType: "GUEST_DEMAND" },
] as const;

const IntakeContext = createContext<IntakeContextValue | null>(null);

interface IntakeSession {
  draft: ShinhanIntakeDraft | null;
  draftPath: ShinhanDraftPath | null;
  privacyReturnTarget: PrivacyReturnTarget | null;
  guestFollowup: GuestFollowupExample | null;
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
  return {
    draft,
    draftPath: pathname,
    privacyReturnTarget: { pathname, applicationType },
    guestFollowup: null,
  };
}

export function ShinhanIntakeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [session, setSession] = useState<IntakeSession>({
    draft: null,
    draftPath: null,
    privacyReturnTarget: null,
    guestFollowup: null,
  });
  let currentSession = session;
  const applicationRoute = applicationRoutes.find((route) => route.pathname === pathname);

  // 같은 layout의 전문 왕복은 유지하고, 다른 작성 화면에 진입할 때만 새 초안을 만든다.
  // 자식이 이전 유형의 상태로 한 번 렌더링되는 effect 초기화를 피한다.
  if (
    applicationRoute &&
    (session.draftPath !== pathname ||
      session.draft?.applicationType !== applicationRoute.applicationType)
  ) {
    currentSession = createSession(applicationRoute.applicationType, applicationRoute.pathname);
    setSession(currentSession);
  } else if (
    pathname === SHINHAN_INTAKE_PREVIEW_PATH &&
    session.draftPath &&
    session.draftPath !== pathname
  ) {
    currentSession = {
      draft: null,
      draftPath: null,
      privacyReturnTarget: null,
      guestFollowup: null,
    };
    setSession(currentSession);
  }
  const { draft, privacyReturnTarget, guestFollowup } = currentSession;

  function startDraft(applicationType: ShinhanApplicationType) {
    setSession(createSession(applicationType, SHINHAN_INTAKE_PREVIEW_PATH));
  }

  function startGuestDraft(
    applicationType: "GUEST_BUDGET" | "GUEST_DEMAND",
    desiredRegionRaw = "",
  ) {
    const nextSession = createSession(
      applicationType,
      applicationType === "GUEST_BUDGET" ? SHINHAN_GUEST_BUDGET_PATH : SHINHAN_GUEST_DEMAND_PATH,
    );
    if (
      nextSession.draft?.applicationType === "GUEST_BUDGET" ||
      nextSession.draft?.applicationType === "GUEST_DEMAND"
    ) {
      nextSession.draft.values.desiredRegionRaw = desiredRegionRaw;
    }
    setSession(nextSession);
  }

  const updateDraft = useCallback((update: (current: ShinhanIntakeDraft) => ShinhanIntakeDraft) => {
    setSession((current) =>
      current.draft ? { ...current, draft: update(current.draft) } : current,
    );
  }, []);

  function startGuestFollowup() {
    const example = createGuestFollowupExample(draft);
    if (!example) return false;
    setSession((current) => ({ ...current, guestFollowup: example }));
    return true;
  }

  const updateGuestFollowup = useCallback(
    (update: (current: GuestFollowupExample) => GuestFollowupExample) => {
      setSession((current) =>
        current.guestFollowup
          ? { ...current, guestFollowup: update(current.guestFollowup) }
          : current,
      );
    },
    [],
  );

  function rememberPrivacyReturn() {
    if (!draft) return;
    const returnPath =
      pathname === SHINHAN_GUEST_FOLLOWUP_PATH && guestFollowup
        ? SHINHAN_GUEST_FOLLOWUP_PATH
        : (currentSession.draftPath ?? SHINHAN_INTAKE_PREVIEW_PATH);
    setSession((current) => ({
      ...current,
      privacyReturnTarget: {
        pathname: returnPath,
        applicationType: draft.applicationType,
      },
    }));
  }

  return (
    <IntakeContext
      value={{
        draft,
        privacyReturnTarget,
        guestFollowup,
        startGuestFollowup,
        updateGuestFollowup,
        startDraft,
        startGuestDraft,
        updateDraft,
        rememberPrivacyReturn,
      }}
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

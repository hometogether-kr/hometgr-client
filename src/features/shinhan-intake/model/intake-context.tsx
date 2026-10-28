"use client";

import { usePathname } from "next/navigation";
import { createContext, type ReactNode, useCallback, useContext, useState } from "react";

import {
  SHINHAN_GUEST_BUDGET_PATH,
  SHINHAN_GUEST_DEMAND_PATH,
  SHINHAN_GUEST_FOLLOWUP_PATH,
  SHINHAN_HOST_ESTIMATE_PATH,
  SHINHAN_HOST_FOLLOWUP_PATH,
  SHINHAN_HOST_REGISTRATION_PATH,
  SHINHAN_INTAKE_PREVIEW_PATH,
  SHINHAN_LEGACY_APPLICATION_ROUTES,
  SHINHAN_LEGACY_SAVED_APPLICATION_PATH,
  SHINHAN_SAVED_APPLICATION_PATH,
  type ShinhanDraftPath,
} from "../config/routes";
import { createGuestFollowupExample, type GuestFollowupExample } from "./guest-followup";
import { createHostFollowupExample, type HostFollowupExample } from "./host-followup";
import {
  createShinhanDraft,
  type ShinhanApplicationType,
  type ShinhanGuestBudgetValues,
  type ShinhanIntakeDraft,
} from "./intake-draft";

interface PrivacyReturnTarget {
  pathname: ShinhanDraftPath;
  applicationType: ShinhanApplicationType;
}

interface IntakeContextValue {
  draftGeneration: number;
  draft: ShinhanIntakeDraft | null;
  privacyReturnTarget: PrivacyReturnTarget | null;
  guestFollowup: GuestFollowupExample | null;
  startGuestFollowup: () => boolean;
  updateGuestFollowup: (update: (example: GuestFollowupExample) => GuestFollowupExample) => void;
  hostFollowup: HostFollowupExample | null;
  startHostFollowup: () => boolean;
  updateHostFollowup: (update: (example: HostFollowupExample) => HostFollowupExample) => void;
  startDraft: (applicationType: ShinhanApplicationType) => void;
  startGuestDraft: (
    applicationType: "GUEST_BUDGET" | "GUEST_DEMAND",
    desiredRegionRaw?: string,
    initialValues?: Partial<ShinhanGuestBudgetValues>,
  ) => void;
  updateDraft: (update: (draft: ShinhanIntakeDraft) => ShinhanIntakeDraft) => void;
  rememberPrivacyReturn: () => void;
}

const applicationRoutes = [
  ...SHINHAN_LEGACY_APPLICATION_ROUTES,
  { pathname: SHINHAN_HOST_ESTIMATE_PATH, applicationType: "HOST_ESTIMATE" },
  { pathname: SHINHAN_HOST_REGISTRATION_PATH, applicationType: "HOST_REGISTRATION" },
  { pathname: SHINHAN_GUEST_BUDGET_PATH, applicationType: "GUEST_BUDGET" },
  { pathname: SHINHAN_GUEST_DEMAND_PATH, applicationType: "GUEST_DEMAND" },
] as const;

const IntakeContext = createContext<IntakeContextValue | null>(null);

interface IntakeSession {
  draftGeneration: number;
  draft: ShinhanIntakeDraft | null;
  draftPath: ShinhanDraftPath | null;
  privacyReturnTarget: PrivacyReturnTarget | null;
  guestFollowup: GuestFollowupExample | null;
  hostFollowup: HostFollowupExample | null;
}

function createSession(
  applicationType: ShinhanApplicationType,
  pathname: ShinhanDraftPath,
  draftGeneration: number,
): IntakeSession {
  const draft = createShinhanDraft(applicationType);
  if (
    applicationType === "HOST_ESTIMATE" &&
    draft.applicationType === "HOST_ESTIMATE" &&
    (pathname === SHINHAN_HOST_ESTIMATE_PATH || pathname === "/shinhan/dev/host/estimate")
  ) {
    draft.values.furniture = { bed: "NONE", desk: "NONE", chair: "NONE", wardrobe: "NONE" };
  }
  return {
    draftGeneration,
    draft,
    draftPath: pathname,
    privacyReturnTarget: { pathname, applicationType },
    guestFollowup: null,
    hostFollowup: null,
  };
}

export function ShinhanIntakeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [session, setSession] = useState<IntakeSession>({
    draftGeneration: 0,
    draft: null,
    draftPath: null,
    privacyReturnTarget: null,
    guestFollowup: null,
    hostFollowup: null,
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
    currentSession = createSession(
      applicationRoute.applicationType,
      applicationRoute.pathname,
      session.draftGeneration + 1,
    );
    setSession(currentSession);
  } else if (
    pathname === SHINHAN_INTAKE_PREVIEW_PATH &&
    session.draftPath &&
    session.draftPath !== pathname
  ) {
    currentSession = {
      draftGeneration: session.draftGeneration + 1,
      draft: null,
      draftPath: null,
      privacyReturnTarget: null,
      guestFollowup: null,
      hostFollowup: null,
    };
    setSession(currentSession);
  }
  const { draft, privacyReturnTarget, guestFollowup, hostFollowup } = currentSession;

  function startDraft(applicationType: ShinhanApplicationType) {
    setSession(
      createSession(
        applicationType,
        SHINHAN_INTAKE_PREVIEW_PATH,
        currentSession.draftGeneration + 1,
      ),
    );
  }

  function startGuestDraft(
    applicationType: "GUEST_BUDGET" | "GUEST_DEMAND",
    desiredRegionRaw = "",
    initialValues?: Partial<ShinhanGuestBudgetValues>,
  ) {
    const nextSession = createSession(
      applicationType,
      applicationType === "GUEST_BUDGET" ? SHINHAN_GUEST_BUDGET_PATH : SHINHAN_GUEST_DEMAND_PATH,
      currentSession.draftGeneration + 1,
    );
    if (
      nextSession.draft?.applicationType === "GUEST_BUDGET" ||
      nextSession.draft?.applicationType === "GUEST_DEMAND"
    ) {
      nextSession.draft.values.desiredRegionRaw = desiredRegionRaw;
    }
    if (nextSession.draft?.applicationType === "GUEST_BUDGET" && initialValues) {
      nextSession.draft.values = { ...nextSession.draft.values, ...initialValues };
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
    let returnPath = currentSession.draftPath ?? SHINHAN_INTAKE_PREVIEW_PATH;
    if (pathname === SHINHAN_GUEST_FOLLOWUP_PATH && guestFollowup)
      returnPath = SHINHAN_GUEST_FOLLOWUP_PATH;
    if (pathname === SHINHAN_HOST_FOLLOWUP_PATH && hostFollowup)
      returnPath = SHINHAN_HOST_FOLLOWUP_PATH;
    if (
      pathname === SHINHAN_SAVED_APPLICATION_PATH ||
      pathname === SHINHAN_LEGACY_SAVED_APPLICATION_PATH
    )
      returnPath = pathname;
    setSession((current) => ({
      ...current,
      privacyReturnTarget: {
        pathname: returnPath,
        applicationType: draft.applicationType,
      },
    }));
  }

  function startHostFollowup() {
    const example = createHostFollowupExample(draft);
    if (!example) return false;
    setSession((current) => ({ ...current, hostFollowup: example }));
    return true;
  }

  const updateHostFollowup = useCallback(
    (update: (current: HostFollowupExample) => HostFollowupExample) => {
      setSession((current) =>
        current.hostFollowup ? { ...current, hostFollowup: update(current.hostFollowup) } : current,
      );
    },
    [],
  );

  return (
    <IntakeContext
      value={{
        draftGeneration: currentSession.draftGeneration,
        draft,
        privacyReturnTarget,
        guestFollowup,
        startGuestFollowup,
        updateGuestFollowup,
        hostFollowup,
        startHostFollowup,
        updateHostFollowup,
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

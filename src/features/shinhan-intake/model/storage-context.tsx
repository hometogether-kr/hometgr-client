"use client";

import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, type ReactNode, useContext, useEffect, useRef, useState } from "react";

import {
  getShinhanApplication,
  getShinhanConsents,
  ShinhanApiError,
  type ShinhanApplication,
  shinhanApplicationKeys,
  type ShinhanConsents,
} from "@/domains/shinhan-application";

import {
  createShinhanApplication,
  createShinhanSession,
  requestShinhanIntroduction,
  resetShinhanSession,
  submitShinhanConcerns,
} from "../api/application.api";
import {
  getShinhanInputFieldErrors,
  prepareShinhanApplicationInput,
} from "../api/application-input.mapper";
import {
  type ShinhanConcernsInput,
  shinhanConcernsInputSchema,
  type ShinhanCreateApplicationInput,
} from "../api/application-input.schema";
import { useShinhanIntake } from "./intake-context";

export type SavedStep =
  | "complete"
  | "result"
  | "concerns"
  | "introduction"
  | "introComplete"
  | "guide"
  | "notice"
  | "receipt"
  | "examples";

type StorageAttempt =
  | { kind: "create"; idempotencyKey: string; input: ShinhanCreateApplicationInput }
  | { kind: "concerns"; idempotencyKey: string; applicationId: string; input: ShinhanConcernsInput }
  | { kind: "introduction"; idempotencyKey: string; applicationId: string };

interface StorageContextValue {
  sessionMode: "local" | "remote" | "unavailable";
  submissionAvailable: boolean;
  consents: ShinhanConsents | null;
  consentPreparationStarted: boolean;
  application: ShinhanApplication | undefined;
  preparing: boolean;
  pending: boolean;
  error: ShinhanApiError | null;
  fieldErrors: Record<string, string[]>;
  attempt: StorageAttempt | null;
  retryInSeconds: number;
  retryReady: boolean;
  prepare: () => Promise<void>;
  sessionExpired: boolean;
  restartSession: () => Promise<void>;
  submitApplication: () => Promise<boolean>;
  submitConcerns: () => Promise<boolean>;
  requestIntroduction: () => Promise<boolean>;
  retry: () => Promise<boolean>;
  clearRejectedAttempt: () => void;
  refresh: () => Promise<void>;
  refreshing: boolean;
  queryError: Error | null;
  step: SavedStep;
  setStep: (step: SavedStep) => void;
  concernCodes: string[];
  setConcernCodes: (codes: string[]) => void;
  guideMode: "selected" | "all";
  setGuideMode: (mode: "selected" | "all") => void;
}

const StorageContext = createContext<StorageContextValue | null>(null);

interface ShinhanStorageProviderProps {
  children: ReactNode;
  sessionMode: "local" | "remote" | "unavailable";
}

export function ShinhanStorageProvider({ children, sessionMode }: ShinhanStorageProviderProps) {
  const { draftGeneration } = useShinhanIntake();
  return (
    <StorageQueryScope key={draftGeneration} sessionMode={sessionMode}>
      {children}
    </StorageQueryScope>
  );
}

function StorageQueryScope({ children, sessionMode }: ShinhanStorageProviderProps) {
  // Anonymous intake has a separate session from account login; its 401 must preserve the draft.
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: false, staleTime: Infinity, refetchOnWindowFocus: false },
          mutations: { retry: false },
        },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      <StorageSession sessionMode={sessionMode}>{children}</StorageSession>
    </QueryClientProvider>
  );
}

function isCorrectable(error: ShinhanApiError | null) {
  return (
    error &&
    ([400, 413, 422].includes(error.status) ||
      error.code === "CONSENT_VERSION_MISMATCH" ||
      error.code === "CSRF_INVALID")
  );
}

function toStorageError(error: unknown): ShinhanApiError {
  if (error instanceof ShinhanApiError) return error;
  return new ShinhanApiError("입력값과 동의 내용을 확인해 주세요.", {
    status: 422,
    kind: "validation",
    code: "VALIDATION_ERROR",
    retryable: false,
    fieldErrors: getShinhanInputFieldErrors(error),
  });
}

function StorageSession({ children, sessionMode }: ShinhanStorageProviderProps) {
  const { draft, updateDraft } = useShinhanIntake();
  const submissionAvailable =
    sessionMode === "local" ||
    (sessionMode === "remote" &&
      (draft?.applicationType === "HOST_REGISTRATION" ||
        draft?.applicationType === "HOST_ESTIMATE"));
  const queryClient = useQueryClient();
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const consentsQuery = useQuery<ShinhanConsents>({
    queryKey: shinhanApplicationKeys.consents(),
    queryFn: ({ signal }) => getShinhanConsents(signal),
    enabled: false,
  });
  const applicationQuery = useQuery({
    queryKey: shinhanApplicationKeys.detail(applicationId),
    queryFn: ({ signal }) => {
      if (!applicationId) throw new Error("Application is not available.");
      return getShinhanApplication(applicationId, signal);
    },
    enabled: false,
  });
  const consents = consentsQuery.data ?? null;
  const application = applicationQuery.data;
  const [preparing, setPreparing] = useState(false);
  const [consentPreparationStarted, setConsentPreparationStarted] = useState(false);
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  const retainedAttempt = useRef<StorageAttempt | null>(null);
  const [attempt, setAttempt] = useState<StorageAttempt | null>(null);
  const [error, setError] = useState<ShinhanApiError | null>(null);
  const [sessionResetRequired, setSessionResetRequired] = useState(false);
  const lastCsrfToken = useRef<string | null>(null);
  const [retryAt, setRetryAt] = useState(0);
  const [retryInSeconds, setRetryInSeconds] = useState(0);
  const [step, setStep] = useState<SavedStep>("complete");
  const [concernCodes, setConcernCodes] = useState<string[]>([]);
  const [guideMode, setGuideMode] = useState<"selected" | "all">("selected");
  const lastCreateInput = useRef<ShinhanCreateApplicationInput | null>(null);
  const sessionExpired =
    sessionResetRequired ||
    error?.status === 401 ||
    (applicationQuery.error instanceof ShinhanApiError && applicationQuery.error.status === 401);

  useEffect(() => {
    if (!retryAt) return;
    const timer = window.setInterval(
      () => setRetryInSeconds(Math.max(0, Math.ceil((retryAt - Date.now()) / 1000))),
      250,
    );
    return () => window.clearInterval(timer);
  }, [retryAt]);

  useEffect(() => {
    if (!attempt) return;
    const preserveAttempt = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", preserveAttempt);
    return () => window.removeEventListener("beforeunload", preserveAttempt);
  }, [attempt]);

  function recordError(cause: unknown) {
    const next = toStorageError(cause);
    if (next.status === 401) setSessionResetRequired(true);
    setError(next);
    setRetryInSeconds(next.retryAfter ?? 0);
    setRetryAt(next.retryAfter ? Date.now() + next.retryAfter * 1000 : 0);
  }

  async function prepare() {
    if (
      !submissionAvailable ||
      busy.current ||
      retainedAttempt.current ||
      sessionExpired ||
      Date.now() < retryAt
    )
      return;
    busy.current = true;
    setPreparing(true);
    setConsentPreparationStarted(true);
    setError(null);
    try {
      const initialize = async () => {
        const snapshot = await getShinhanConsents();
        lastCsrfToken.current = snapshot.csrfToken;
        await createShinhanSession(snapshot.csrfToken);
        return snapshot;
      };
      // Multiple tabs must share the first CSRF cookie and anonymous session.
      let snapshot: ShinhanConsents;
      if (navigator.locks) {
        try {
          snapshot = await navigator.locks.request("shinhan-intake-session", initialize);
        } catch (cause) {
          if (cause instanceof ShinhanApiError) throw cause;
          throw new ShinhanApiError(
            "신청 준비를 위한 브라우저 잠금을 사용할 수 없습니다. 지원되는 브라우저에서 다시 시도해 주세요.",
            {
              status: 0,
              kind: "unknown",
              code: "SESSION_LOCK_UNAVAILABLE",
              retryable: false,
            },
          );
        }
      } else if (sessionMode === "local") {
        snapshot = await initialize();
      } else {
        throw new ShinhanApiError(
          "이 브라우저에서는 안전하게 신청을 준비할 수 없습니다. 지원되는 브라우저에서 다시 시도해 주세요.",
          {
            status: 0,
            kind: "unknown",
            code: "SESSION_LOCK_UNAVAILABLE",
            retryable: false,
          },
        );
      }
      queryClient.setQueryData(shinhanApplicationKeys.consents(), snapshot);
      updateDraft((current) => ({ ...current, requiredConsent: false }));
    } catch (cause) {
      recordError(cause);
    } finally {
      busy.current = false;
      setPreparing(false);
    }
  }

  async function restartSession() {
    if (busy.current || !sessionExpired) return;
    busy.current = true;
    setPreparing(true);
    setSessionResetRequired(true);
    try {
      const reset = () => resetShinhanSession(lastCsrfToken.current ?? consents?.csrfToken ?? null);
      if (navigator.locks) await navigator.locks.request("shinhan-intake-session", reset);
      else if (sessionMode === "local") await reset();
      else
        throw new ShinhanApiError("지원되는 브라우저에서 새 신청 세션을 시작해 주세요.", {
          status: 0,
          kind: "unknown",
          code: "SESSION_LOCK_UNAVAILABLE",
          retryable: false,
        });
      await queryClient.cancelQueries();
      await queryClient.resetQueries();
      queryClient.clear();
      setApplicationId(null);
      retainedAttempt.current = null;
      lastCreateInput.current = null;
      lastCsrfToken.current = null;
      setAttempt(null);
      setConcernCodes([]);
      setStep("complete");
      setError(null);
      setRetryAt(0);
      setRetryInSeconds(0);
      setConsentPreparationStarted(false);
      setSessionResetRequired(false);
      updateDraft((current) => ({ ...current, requiredConsent: false }));
    } catch (cause) {
      recordError(cause);
    } finally {
      busy.current = false;
      setPreparing(false);
    }
  }

  async function execute(next: StorageAttempt): Promise<boolean> {
    if (
      busy.current ||
      !consents ||
      sessionExpired ||
      (applicationQuery.error instanceof ShinhanApiError && applicationQuery.error.status === 401)
    )
      return false;
    busy.current = true;
    retainedAttempt.current = next;
    setAttempt(next);
    setPending(true);
    setError(null);
    try {
      // An older read must not overwrite the version returned by this mutation.
      await queryClient.cancelQueries({ queryKey: shinhanApplicationKeys.detail(applicationId) });
      const credentials = { csrfToken: consents.csrfToken, idempotencyKey: next.idempotencyKey };
      const saved =
        next.kind === "create"
          ? await createShinhanApplication({ ...credentials, input: next.input })
          : next.kind === "concerns"
            ? await submitShinhanConcerns({
                ...credentials,
                applicationId: next.applicationId,
                input: next.input,
              })
            : await requestShinhanIntroduction({
                ...credentials,
                applicationId: next.applicationId,
              });
      queryClient.setQueryData(shinhanApplicationKeys.detail(saved.applicationId), saved);
      setApplicationId(saved.applicationId);
      if (next.kind === "create") {
        lastCreateInput.current = next.input;
        setConcernCodes([]);
        setStep(saved.applicationType === "HOST_ESTIMATE" ? "result" : "complete");
      } else if (next.kind === "concerns") {
        setGuideMode("selected");
        setStep(saved.applicationType === "HOST_ESTIMATE" ? "introduction" : "guide");
      } else {
        setStep("introComplete");
      }
      retainedAttempt.current = null;
      setAttempt(null);
      setRetryAt(0);
      setRetryInSeconds(0);
      return true;
    } catch (cause) {
      recordError(cause);
      return false;
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  async function submitApplication(): Promise<boolean> {
    if (
      !submissionAvailable ||
      !draft ||
      !consents ||
      sessionExpired ||
      busy.current ||
      retainedAttempt.current
    )
      return false;
    try {
      const input = prepareShinhanApplicationInput(draft, consents.required.version);
      if (application) {
        if (application.applicationType !== "HOST_ESTIMATE") return false;
        if (JSON.stringify(input) === JSON.stringify(lastCreateInput.current)) {
          setStep("result");
          return true;
        }
      }
      return await execute({ kind: "create", input, idempotencyKey: crypto.randomUUID() });
    } catch (cause) {
      recordError(cause);
      return false;
    }
  }

  async function saveConcerns(): Promise<boolean> {
    if (
      !application ||
      application.applicationType === "HOST_REGISTRATION" ||
      (sessionMode !== "local" &&
        !(sessionMode === "remote" && application.applicationType === "HOST_ESTIMATE")) ||
      !consents ||
      sessionExpired ||
      busy.current ||
      retainedAttempt.current
    )
      return false;
    try {
      const input = shinhanConcernsInputSchema.parse({
        state: "SUBMITTED",
        concernCodes,
      });
      return await execute({
        kind: "concerns",
        input,
        applicationId: application.applicationId,
        idempotencyKey: crypto.randomUUID(),
      });
    } catch (cause) {
      recordError(cause);
      return false;
    }
  }

  async function saveIntroduction(): Promise<boolean> {
    if (
      (sessionMode !== "local" && sessionMode !== "remote") ||
      !application ||
      application.applicationType !== "HOST_ESTIMATE" ||
      sessionExpired ||
      busy.current ||
      retainedAttempt.current
    )
      return false;
    if (application.introductionRequestedAt) {
      setStep("introComplete");
      return true;
    }
    return execute({
      kind: "introduction",
      applicationId: application.applicationId,
      idempotencyKey: crypto.randomUUID(),
    });
  }

  async function retry(): Promise<boolean> {
    if (!retainedAttempt.current || !error?.retryable || Date.now() < retryAt) return false;
    return execute(retainedAttempt.current);
  }

  function clearRejectedAttempt() {
    if (busy.current || !isCorrectable(error)) return;
    if (error?.code === "CONSENT_VERSION_MISMATCH" || error?.code === "CSRF_INVALID") {
      void queryClient.resetQueries({ queryKey: shinhanApplicationKeys.consents() });
      updateDraft((current) => ({ ...current, requiredConsent: false }));
    }
    retainedAttempt.current = null;
    setAttempt(null);
    setError(null);
  }

  async function refresh() {
    if (!applicationId || busy.current) return;
    await applicationQuery.refetch();
  }

  return (
    <StorageContext
      value={{
        sessionMode,
        submissionAvailable,
        consents,
        consentPreparationStarted,
        application,
        preparing,
        pending,
        error,
        fieldErrors: error?.fieldErrors ?? {},
        attempt,
        retryInSeconds,
        retryReady: Boolean(attempt && error?.retryable && retryInSeconds === 0 && !pending),
        prepare,
        sessionExpired,
        restartSession,
        submitApplication,
        submitConcerns: saveConcerns,
        requestIntroduction: saveIntroduction,
        retry,
        clearRejectedAttempt,
        refresh,
        refreshing: applicationQuery.isFetching,
        queryError: applicationQuery.error,
        step,
        setStep,
        concernCodes,
        setConcernCodes,
        guideMode,
        setGuideMode,
      }}
    >
      {children}
    </StorageContext>
  );
}

export function useShinhanStorage() {
  const context = useContext(StorageContext);
  if (!context) throw new Error("ShinhanStorageProvider is required.");
  return context;
}

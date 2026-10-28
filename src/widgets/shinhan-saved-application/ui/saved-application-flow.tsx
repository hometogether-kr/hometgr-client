"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useRef } from "react";

import { BetaFlowObserver } from "@/features/beta-tracking";
import {
  ShinhanConsentStatus,
  ShinhanHostProgress,
  ShinhanSessionRestart,
  useShinhanStorage,
} from "@/features/shinhan-intake";

import { SavedMutationError, SavedNavigationButton } from "./saved-application-actions";
import { SavedApplicationSummary } from "./saved-application-details";

import styles from "./saved-application-flow.module.css";

interface SavedApplicationFlowProps {
  hostRegistration: ReactNode;
  hostResult: ReactNode;
  hostIntroduction: ReactNode;
  hostIntroComplete: ReactNode;
  guestBudgetComplete: ReactNode;
  guestExamples: ReactNode;
  guestDemandComplete: ReactNode;
}

export function ShinhanSavedApplicationFlow(props: SavedApplicationFlowProps) {
  const { application, step, consents } = useShinhanStorage();
  const focusTarget = useRef<HTMLDivElement>(null);
  useEffect(() => {
    focusTarget.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [step]);

  if (!application)
    return (
      <section className={styles.empty}>
        <h1>저장된 신청을 확인할 수 없어요</h1>
        <p>
          이 탭에서 신청을 저장한 뒤 확인할 수 있습니다. 새로고침이나 직접 주소 접근으로 신청이
          만들어지지 않습니다.
        </p>
        <Link href="/shinhan">신한 서비스에서 신청 시작하기</Link>
      </section>
    );

  const isHostEstimate = application.applicationType === "HOST_ESTIMATE";
  const currentHostStep =
    step === "introComplete" ? "complete" : step === "introduction" ? "introduction" : "result";
  return (
    <div className={styles.container} ref={focusTarget} tabIndex={-1} aria-label="저장된 신한 신청">
      {isHostEstimate && <ShinhanHostProgress currentStep={currentHostStep} />}
      <SavedMutationError />
      <ShinhanSessionRestart />
      {!consents && <ShinhanConsentStatus />}
      {!isHostEstimate && (
        <>
          <BetaFlowObserver flow={application.applicationType} resultVisible />
          {application.applicationType === "HOST_REGISTRATION" ? (
            props.hostRegistration
          ) : application.applicationType === "GUEST_BUDGET" ? (
            step === "examples" ? (
              <>
                <h1 className="mb-5 text-3xl font-bold">내 조건에 맞는 집 · 공간 사진</h1>
                {props.guestExamples}
                <div className="mx-auto mt-6 max-w-md">
                  <SavedNavigationButton step="complete">
                    신청 완료 화면으로 돌아가기
                  </SavedNavigationButton>
                </div>
              </>
            ) : (
              props.guestBudgetComplete
            )
          ) : (
            props.guestDemandComplete
          )}
        </>
      )}
      {isHostEstimate && step !== "introduction" && step !== "introComplete" && (
        <>
          <BetaFlowObserver flow="HOST_ESTIMATE" resultVisible />
          {props.hostResult}
          <details className={styles.resultDetails}>
            <summary>저장된 입력 조건 확인</summary>
            <SavedApplicationSummary />
          </details>
        </>
      )}
      {isHostEstimate && step === "introduction" && props.hostIntroduction}
      {isHostEstimate && step === "introComplete" && props.hostIntroComplete}
    </div>
  );
}

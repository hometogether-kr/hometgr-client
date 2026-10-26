"use client";

import Link from "next/link";
import { type FormEvent, type ReactNode, useEffect, useRef } from "react";

import {
  ShinhanHostProgress,
  ShinhanLivePreparation,
  ShinhanPrivacyLink,
  ShinhanSessionRestart,
  useShinhanStorage,
} from "@/features/shinhan-intake";
import { BtnCta } from "@/shared/ui/btn-cta";

import {
  SavedHomeLink,
  SavedMutationError,
  SavedNavigationButton,
} from "./saved-application-actions";
import { SavedApplicationSummary } from "./saved-application-details";

import styles from "./saved-application-flow.module.css";

export interface SavedConcernOption {
  code: string;
  title: string;
  description: string;
}
export interface SavedApplicationFlowProps {
  hostRegistration: ReactNode;
  hostResult: ReactNode;
  hostIntroduction: ReactNode;
  hostIntroComplete: ReactNode;
  guestBudgetComplete: ReactNode;
  guestDemandComplete: ReactNode;
  guideCards: { code: string; content: ReactNode }[];
  guestNotice: ReactNode;
  guestReceiptIntroduction: ReactNode;
  examples: ReactNode;
  hostConcerns: readonly SavedConcernOption[];
  guestConcerns: readonly SavedConcernOption[];
}

export function ShinhanSavedApplicationFlow(props: SavedApplicationFlowProps) {
  const storage = useShinhanStorage();
  const {
    application,
    step,
    setStep,
    pending,
    preparing,
    sessionExpired,
    attempt,
    consents,
    concernCodes,
    setConcernCodes,
    submitConcerns,
    guideMode,
    setGuideMode,
    fieldErrors,
  } = storage;
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
  const isGuest =
    application.applicationType === "GUEST_BUDGET" ||
    application.applicationType === "GUEST_DEMAND";
  const blocked = pending || preparing || Boolean(attempt);
  const concerns = isHostEstimate ? props.hostConcerns : props.guestConcerns;
  const visibleCards =
    guideMode === "all"
      ? props.guideCards
      : props.guideCards.filter(({ code }) =>
          application.concerns.codes.some((savedCode) => savedCode === code),
        );
  function showAllGuide() {
    setGuideMode("all");
    setStep("guide");
  }
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!blocked && !sessionExpired && consents) void submitConcerns();
  }
  function toggleConcern(code: string) {
    setConcernCodes(
      concernCodes.includes(code)
        ? concernCodes.filter((selected) => selected !== code)
        : [...concernCodes, code],
    );
  }
  const currentHostStep =
    step === "introComplete"
      ? "complete"
      : step === "concerns"
        ? "concerns"
        : step === "introduction"
          ? "introduction"
          : "result";

  return (
    <div className={styles.container} ref={focusTarget} tabIndex={-1} aria-label="저장된 신한 신청">
      <p className={styles.localBanner}>
        접수된 신청 내역입니다. 접수 완료와 안내 메시지 전달 완료는 다릅니다.
      </p>
      {isHostEstimate && <ShinhanHostProgress currentStep={currentHostStep} />}
      {application.applicationType === "HOST_REGISTRATION" && (
        <ol className={styles.registrationProgress} aria-label="방 등록 진행 단계">
          <li>✓ 기본 정보 입력</li>
          <li aria-current="step">02 심사 안내</li>
        </ol>
      )}
      <SavedMutationError />
      <ShinhanSessionRestart />
      {!consents && <ShinhanLivePreparation />}
      {step === "complete" &&
        (application.applicationType === "HOST_REGISTRATION"
          ? props.hostRegistration
          : application.applicationType === "GUEST_BUDGET"
            ? props.guestBudgetComplete
            : application.applicationType === "GUEST_DEMAND"
              ? props.guestDemandComplete
              : null)}
      {step === "result" && isHostEstimate && (
        <>
          {props.hostResult}
          <details className={styles.resultDetails}>
            <summary>저장된 입력 조건 확인</summary>
            <SavedApplicationSummary
              concernLabels={Object.fromEntries(concerns.map(({ code, title }) => [code, title]))}
            />
          </details>
        </>
      )}
      {step === "introduction" && isHostEstimate && props.hostIntroduction}
      {step === "introComplete" && isHostEstimate && props.hostIntroComplete}
      {step === "concerns" && (
        <form noValidate onSubmit={handleSubmit} className={styles.concernForm}>
          <header className={styles.heading}>
            <h1>
              {isHostEstimate ? "어떤 점이 가장 걱정되세요?" : "홈쉐어링에서 어떤 점이 걱정되나요?"}
            </h1>
            <p>걱정되는 점을 모두 골라주세요. 여러 개 선택할 수 있어요.</p>
          </header>
          <fieldset className={styles.concerns} disabled={blocked || sessionExpired}>
            <legend className="sr-only">걱정되는 점 (여러 개 선택 가능)</legend>
            {concerns.map((concern) => (
              <button
                key={concern.code}
                type="button"
                className={styles.concern}
                aria-pressed={concernCodes.includes(concern.code)}
                onClick={() => toggleConcern(concern.code)}
              >
                <span className={styles.checkMark} aria-hidden="true">
                  {concernCodes.includes(concern.code) ? "✓" : ""}
                </span>
                <span>
                  <strong>{concern.title}</strong>
                  <span className={styles.concernDescription}>{concern.description}</span>
                </span>
              </button>
            ))}
          </fieldset>
          <div>
            {Object.entries(fieldErrors).map(([field, messages]) => (
              <p key={field} role="alert" className={styles.fieldError}>
                {messages.join(" ")}
              </p>
            ))}
          </div>
          <div className={styles.actionRow}>
            {isHostEstimate ? (
              <SavedNavigationButton step="result" variant="secondary">
                예상 수익 다시 보기
              </SavedNavigationButton>
            ) : (
              <BtnCta
                variant="stroke"
                className={styles.secondaryButton}
                disabled={blocked}
                onClick={showAllGuide}
              >
                전체 확인 사항 보기
              </BtnCta>
            )}
            <BtnCta
              type="submit"
              className={styles.primaryButton}
              loading={pending && attempt?.kind === "concerns"}
              disabled={blocked || sessionExpired || !consents}
            >
              {isHostEstimate ? "선택한 걱정으로 시작 방법 보기" : "선택한 내용 확인하기"}
            </BtnCta>
          </div>
          <p className={styles.help}>
            아무 항목도 고르지 않고 저장하면 ‘선택한 걱정 없음’으로 기록합니다.
          </p>
        </form>
      )}
      {step === "guide" && isGuest && (
        <section>
          <header className={styles.heading}>
            <h1>걱정되는 부분부터 함께 확인할게요</h1>
            <p>신청하신 방을 안내할 때, 아래 내용을 함께 확인해드릴게요.</p>
          </header>
          <p className={styles.help}>
            {guideMode === "all"
              ? "전체 확인 사항 · 저장된 걱정 응답은 바뀌지 않아요"
              : "저장한 걱정의 확인 사항"}
          </p>
          <div className={styles.guideGrid}>
            {visibleCards.map(({ code, content }) => (
              <div key={code}>{content}</div>
            ))}
          </div>
          {visibleCards.length === 0 && (
            <div className={styles.centerActions}>
              <p>선택한 걱정이 없어요. 전체 확인 사항을 살펴볼 수 있어요.</p>
              <BtnCta variant="stroke" disabled={blocked} onClick={showAllGuide}>
                전체 확인 사항 보기
              </BtnCta>
            </div>
          )}
          <div className={styles.centerActions}>
            <SavedNavigationButton step="notice">집주인 프로필 보고 결정하기</SavedNavigationButton>
            <p className={styles.help}>방과 집주인 정보를 안내받는 방법을 확인하세요.</p>
            <SavedNavigationButton step="concerns" variant="secondary">
              걱정 다시 선택하기
            </SavedNavigationButton>
          </div>
        </section>
      )}
      {step === "notice" && isGuest && props.guestNotice}
      {step === "receipt" && (
        <section className={isGuest ? styles.receiptLayout : undefined}>
          {isGuest && props.guestReceiptIntroduction}
          <div className={styles.receiptActions}>
            <SavedApplicationSummary
              concernLabels={Object.fromEntries(concerns.map(({ code, title }) => [code, title]))}
            />
            {isGuest ? (
              <SavedHomeLink role="guest" />
            ) : (
              <SavedNavigationButton step="complete" variant="secondary">
                심사 안내로 돌아가기
              </SavedNavigationButton>
            )}
          </div>
        </section>
      )}
      {step === "examples" && isGuest && (
        <section>
          <header className={styles.heading}>
            <h1>
              {application.applicationType === "GUEST_BUDGET" ? (
                <>
                  이런 집에서 살 수 있는 곳을 <em>찾았어요</em>
                </>
              ) : (
                <>
                  입력하신 조건이라면,
                  <br />
                  <em>이런 집</em>에서 거주하실 수 있어요!
                </>
              )}
            </h1>
            <p>신청할 때 살펴본 공통 공간 예시입니다. 실제 매물 검색 결과가 아닙니다.</p>
          </header>
          {props.examples}
          <div className={styles.centerActions}>
            <SavedApplicationSummary
              concernLabels={Object.fromEntries(concerns.map(({ code, title }) => [code, title]))}
            />
            <SavedNavigationButton step="receipt">신청 내역으로 돌아가기</SavedNavigationButton>
            <SavedNavigationButton step="complete" variant="secondary">
              접수 완료 안내 다시 보기
            </SavedNavigationButton>
          </div>
        </section>
      )}
      <div className={styles.privacy}>
        <ShinhanPrivacyLink>기본 신청 개인정보 전문 보기</ShinhanPrivacyLink>
      </div>
    </div>
  );
}

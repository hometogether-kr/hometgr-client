"use client";

import Link from "next/link";
import { type FormEvent, type ReactNode, useEffect, useId, useRef, useState } from "react";

import {
  confirmGuestConcerns,
  type GuestConcernCode,
  type GuestFollowupStep,
  ShinhanPrivacyLink,
  showAllGuide,
  useShinhanIntake,
} from "@/features/shinhan-intake";
import { BtnCta } from "@/shared/ui/btn-cta";
import { Checkbox } from "@/shared/ui/checkbox";

import { GUEST_CONCERNS } from "../config/content";
import { GuestReceiptDetails } from "./guest-receipt-details";

import styles from "./shinhan-guest-followup-flow.module.css";

interface GuestFollowupFlowProps {
  guideCards: { code: GuestConcernCode; content: ReactNode }[];
  notice: ReactNode;
  receiptIntroduction: ReactNode;
  brand: ReactNode;
  examples: ReactNode;
}

export function GuestFollowupNavigationButton({
  step,
  children,
}: {
  step: GuestFollowupStep;
  children: ReactNode;
}) {
  const { updateGuestFollowup } = useShinhanIntake();
  return (
    <BtnCta
      className={styles.primaryButton}
      onClick={() => updateGuestFollowup((current) => ({ ...current, step }))}
    >
      {children}
    </BtnCta>
  );
}

export function ShinhanGuestFollowupFlow({
  guideCards,
  notice,
  receiptIntroduction,
  brand,
  examples,
}: GuestFollowupFlowProps) {
  const { guestFollowup: example, updateGuestFollowup } = useShinhanIntake();
  const [attempted, setAttempted] = useState(false);
  const focusTarget = useRef<HTMLDivElement>(null);
  const id = useId();
  const step = example?.step;

  // 단계 전환 후 키보드·스크린리더가 새 내용을 바로 탐색할 수 있게 한다.
  useEffect(() => {
    if (!step) return;
    focusTarget.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [step]);

  if (!example)
    return (
      <section className={styles.empty}>
        <h1>작성 중인 게스트 신청이 필요해요</h1>
        <p>
          신청 조건과 연락처를 입력한 뒤 개발용 미리보기로 들어와 주세요. 새로고침하면 이 탭의
          미리보기는 초기화됩니다.
        </p>
        <Link href="/shinhan/guest">게스트 소개로 돌아가기</Link>
      </section>
    );

  const consentError = attempted && example.optionalConsent !== true;
  const visibleCards =
    example.guideMode === "all"
      ? guideCards
      : guideCards.filter(({ code }) => example.response.codes.includes(code));

  function moveTo(nextStep: GuestFollowupStep) {
    updateGuestFollowup((current) => ({ ...current, step: nextStep }));
  }

  function handleConcernSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempted(true);
    updateGuestFollowup((current) => confirmGuestConcerns(current) ?? current);
  }

  function toggleConcern(code: GuestConcernCode) {
    updateGuestFollowup((current) => ({
      ...current,
      selectedCodes: current.selectedCodes.includes(code)
        ? current.selectedCodes.filter((selected) => selected !== code)
        : [...current.selectedCodes, code],
    }));
  }

  return (
    <div
      ref={focusTarget}
      tabIndex={-1}
      className={styles.container}
      aria-label="게스트 신청 후 화면 미리보기"
    >
      <p className={styles.pathLabel}>
        {example.application.applicationType === "GUEST_BUDGET"
          ? "예산 매칭"
          : "위치·예산 수요조사"}{" "}
        ·{" "}
        {example.step === "receipt" || example.step === "spaces" ? "조회 전용" : "개발용 미리보기"}
      </p>
      {example.step === "concerns" && (
        <form noValidate onSubmit={handleConcernSubmit}>
          <header className={styles.heading}>
            <h1>홈쉐어링에서 어떤 점이 걱정되나요?</h1>
            <p>
              걱정되는 점을 모두 골라주세요.
              <br />
              선택한 항목별로 입주 전에 확인할 내용을 알려드려요.
            </p>
          </header>
          <fieldset className={styles.concerns}>
            <legend className="sr-only">걱정되는 점 (여러 개 선택 가능)</legend>
            {GUEST_CONCERNS.map((concern) => (
              <button
                key={concern.code}
                type="button"
                className={styles.concern}
                aria-pressed={example.selectedCodes.includes(concern.code)}
                onClick={() => toggleConcern(concern.code)}
              >
                <span className={styles.checkMark} aria-hidden="true">
                  {example.selectedCodes.includes(concern.code) ? "✓" : ""}
                </span>
                <span>
                  <strong>{concern.title}</strong>
                  <span className={styles.concernDescription}>{concern.description}</span>
                </span>
              </button>
            ))}
          </fieldset>
          <div className={styles.consent}>
            <div className={styles.consentLine}>
              <Checkbox
                id={`${id}-consent`}
                checked={example.optionalConsent === true}
                aria-invalid={consentError || undefined}
                aria-describedby={`${id}-consent-help ${id}-consent-error`}
                onChange={(event) =>
                  updateGuestFollowup((current) => ({
                    ...current,
                    optionalConsent: event.target.checked,
                  }))
                }
              />
              <label htmlFor={`${id}-consent`}>걱정 항목 수집·이용 동의 (선택·개발 예시)</label>
            </div>
            <p id={`${id}-consent-help`} className={styles.help}>
              동의 화면의 개발 예시이며 선택 내용은 전송·저장되지 않습니다. 선택 동의의 승인된
              전문은 아직 연결되지 않았습니다.
            </p>
            <ShinhanPrivacyLink>기본 신청 개인정보 전문 보기</ShinhanPrivacyLink>
            <p className={styles.help}>
              위 전문은 기본 신청용이며 걱정 항목의 선택 동의는 포함하지 않습니다.
            </p>
            <p
              id={`${id}-consent-error`}
              role={consentError ? "alert" : undefined}
              className={styles.error}
            >
              {consentError
                ? "선택한 내용을 확인하려면 개발 예시 동의에 체크해 주세요. 동의 없이도 전체 확인 사항을 볼 수 있어요."
                : ""}
            </p>
          </div>
          <p className={styles.centerHelp}>
            걱정되는 점을 선택하지 않아도 전체 확인 사항을 볼 수 있어요.
          </p>
          <div className={styles.concernActions}>
            <BtnCta
              variant="stroke"
              className={styles.secondaryButton}
              onClick={() => updateGuestFollowup(showAllGuide)}
            >
              전체 확인 사항 보기
            </BtnCta>
            <BtnCta type="submit" className={styles.primaryButton}>
              선택한 내용 확인하기
            </BtnCta>
          </div>
        </form>
      )}
      {example.step === "guide" && (
        <section>
          <header className={styles.heading}>
            <h1>걱정되는 부분부터 함께 확인할게요</h1>
            <p>신청하신 방을 안내할 때, 아래 내용을 함께 확인해드릴게요.</p>
          </header>
          <p className={styles.guideMode}>
            {example.guideMode === "all"
              ? "전체 확인 사항 · 걱정 응답과 동의 상태는 바뀌지 않아요"
              : "선택한 걱정의 확인 사항"}
          </p>
          <div className={styles.guideGrid}>
            {visibleCards.map(({ code, content }) => (
              <div key={code}>{content}</div>
            ))}
          </div>
          {visibleCards.length === 0 && (
            <div className={styles.noSelection}>
              <p>선택한 걱정이 없어요. 전체 확인 사항을 읽어보거나 다음 안내로 이동할 수 있어요.</p>
              <BtnCta variant="stroke" onClick={() => updateGuestFollowup(showAllGuide)}>
                전체 확인 사항 보기
              </BtnCta>
            </div>
          )}
          <div className={styles.guideActions}>
            <p>방과 집주인 정보를 먼저 받아보고 결정하세요.</p>
            <GuestFollowupNavigationButton step="notice">
              궁금한 점 전달하기
            </GuestFollowupNavigationButton>
            <p className={styles.help}>
              다음 안내 화면으로 이동합니다. 질문을 작성하거나 전송하지 않습니다.
            </p>
            <button className={styles.textButton} type="button" onClick={() => moveTo("concerns")}>
              ← 걱정 다시 선택하기
            </button>
          </div>
        </section>
      )}
      {example.step === "notice" && notice}
      {example.step === "receipt" && (
        <section className={styles.receiptLayout}>
          {receiptIntroduction}
          <div className={styles.receiptCard}>
            <GuestReceiptDetails example={example} />
            <GuestFollowupNavigationButton step="spaces">
              공간 사진 다시 보기
            </GuestFollowupNavigationButton>
            <button className={styles.textButton} type="button" onClick={() => moveTo("guide")}>
              함께 확인할 내용 다시 보기
            </button>
            {brand}
          </div>
        </section>
      )}
      {example.step === "spaces" && (
        <section>
          <header className={styles.heading}>
            <h1>
              {example.application.applicationType === "GUEST_BUDGET" ? (
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
            <p>신청할 때 살펴본 공통 공간 예시입니다. 입력한 신청 조건은 변경되지 않아요.</p>
          </header>
          {examples}
          <div className={styles.guideActions}>
            <GuestFollowupNavigationButton step="receipt">
              신청 내역으로 돌아가기
            </GuestFollowupNavigationButton>
          </div>
        </section>
      )}
      <div className={styles.privacy}>
        <ShinhanPrivacyLink>기본 신청 개인정보 전문 보기</ShinhanPrivacyLink>
      </div>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import {
  type SavedStep,
  SHINHAN_HOST_ESTIMATE_PATH,
  useShinhanIntake,
  useShinhanStorage,
} from "@/features/shinhan-intake";
import { BtnCta } from "@/shared/ui/btn-cta";

import { formatShinhanMoney } from "./saved-application-details";

import styles from "./saved-application-flow.module.css";

interface SavedNavigationButtonProps {
  step: SavedStep;
  children: ReactNode;
  variant?: "primary" | "secondary";
}

export function SavedNavigationButton({
  step,
  children,
  variant = "primary",
}: SavedNavigationButtonProps) {
  const { setStep, pending, preparing, attempt } = useShinhanStorage();
  return (
    <BtnCta
      variant={variant === "secondary" ? "stroke" : "default"}
      className={variant === "secondary" ? styles.secondaryButton : styles.primaryButton}
      disabled={pending || preparing || Boolean(attempt)}
      onClick={() => setStep(step)}
    >
      {children}
    </BtnCta>
  );
}

export function SavedHostIncome() {
  const { application } = useShinhanStorage();
  if (application?.applicationType !== "HOST_ESTIMATE") return null;
  const { estimate } = application;
  return (
    <div className={styles.income}>
      <p className={styles.badge}>신한 서버에 저장된 계산 결과</p>
      <div className={styles.amounts} aria-label="저장된 예상 수익 범위">
        <div className={styles.monthly}>
          <p>월 예상 수익</p>
          <strong>
            {formatShinhanMoney(estimate.monthlyWon.min)}~
            {formatShinhanMoney(estimate.monthlyWon.max)}만 원
          </strong>
        </div>
        <div className={styles.annual}>
          <p>1년 예상 수익</p>
          <strong>
            {formatShinhanMoney(estimate.annualWon.min)}~
            {formatShinhanMoney(estimate.annualWon.max)}
            <span>만 원</span>
          </strong>
        </div>
      </div>
      <div className={styles.help}>
        <p>참고 지역: {estimate.region.districtUsed ?? "서울 기준 참고값"}</p>
        {estimate.region.source === "seoul_config_average" && (
          <p>입력 지역의 개별 시세가 아닌 서울 기준 참고값을 적용한 예상 금액입니다.</p>
        )}
        <p>계산 규칙: {estimate.rulesVersion}</p>
      </div>
    </div>
  );
}

export function SavedHostResultActions() {
  const { pending, preparing, attempt } = useShinhanStorage();
  const { updateDraft } = useShinhanIntake();
  const router = useRouter();
  function handleEdit() {
    updateDraft((draft) =>
      draft.applicationType === "HOST_ESTIMATE" ? { ...draft, step: "conditions" } : draft,
    );
    router.push(SHINHAN_HOST_ESTIMATE_PATH);
  }
  return (
    <div className={styles.centerActions}>
      <p>수익만큼 중요한 건, 안심하고 시작하는 방법이에요.</p>
      <SavedNavigationButton step="concerns">내 집에 맞는 시작 방법 알아보기</SavedNavigationButton>
      <button
        type="button"
        className={styles.textButton}
        disabled={pending || preparing || Boolean(attempt)}
        onClick={handleEdit}
      >
        ← 입력 정보 수정
      </button>
      <p className={styles.help}>
        조건을 바꿔 제출하면 새 견적으로 저장됩니다. 기존 견적은 유지됩니다.
      </p>
    </div>
  );
}

export function SavedHostIntroductionActions() {
  const { application, pending, preparing, attempt, requestIntroduction, setStep } =
    useShinhanStorage();
  if (application?.applicationType !== "HOST_ESTIMATE") return null;
  return (
    <div className={styles.centerActions}>
      {application.introductionRequestedAt ? (
        <>
          <p>이 견적의 소개서 알림 신청이 이미 접수되었습니다.</p>
          <SavedNavigationButton step="introComplete">신청 완료 내역 보기</SavedNavigationButton>
        </>
      ) : (
        <BtnCta
          className={styles.primaryButton}
          loading={pending && attempt?.kind === "introduction"}
          disabled={pending || preparing || Boolean(attempt)}
          onClick={() => void requestIntroduction()}
        >
          소개서만 먼저 받아보기
        </BtnCta>
      )}
      <button
        type="button"
        className={styles.textButton}
        disabled={pending || preparing || Boolean(attempt)}
        onClick={() => setStep("concerns")}
      >
        ← 걱정 선택 다시 보기
      </button>
      <p className={styles.help}>신청 저장이 완료되면 접수 완료 화면으로 이동합니다.</p>
    </div>
  );
}

export function SavedMutationError() {
  const {
    error,
    pending,
    preparing,
    attempt,
    retry,
    retryInSeconds,
    retryReady,
    clearRejectedAttempt,
    consents,
  } = useShinhanStorage();
  if (!error) return null;
  const canReview =
    [400, 413, 422].includes(error.status) ||
    ["CONSENT_VERSION_MISMATCH", "CSRF_INVALID"].includes(error.code ?? "");
  return (
    <section
      className={styles.errorCard}
      aria-label={!consents && !attempt ? "동의 준비 상태" : "저장 요청 상태"}
    >
      <p role="alert">{error.message}</p>
      <p>
        {!consents && !attempt
          ? "이미 저장된 신청은 유지됩니다. 아래에서 서버 전문을 다시 준비한 뒤 선택 동의를 확인해 주세요."
          : "이미 저장된 신청은 유지됩니다. 현재 요청의 저장 결과가 확인되기 전에는 완료로 처리하지 않습니다."}
      </p>
      {attempt && (
        <p>
          같은 요청으로 재시도할 수 있도록 결과 확인 전에는 새로고침하거나 탭을 닫지 말아 주세요.
        </p>
      )}
      {error.retryable && attempt && (
        <BtnCta
          variant="stroke"
          loading={pending}
          disabled={!retryReady || pending}
          onClick={() => void retry()}
        >
          {retryInSeconds > 0 ? `${retryInSeconds}초 후 재시도` : "같은 요청으로 다시 시도"}
        </BtnCta>
      )}
      {canReview && (
        <BtnCta variant="stroke" disabled={pending || preparing} onClick={clearRejectedAttempt}>
          입력과 동의 다시 확인하기
        </BtnCta>
      )}
      {!error.retryable && !canReview && (
        <p>
          아래 조회 버튼으로 저장 상태를 확인할 수 있습니다. 새 신청을 자동으로 만들지 않습니다.
        </p>
      )}
    </section>
  );
}

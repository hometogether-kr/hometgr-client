"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useCallback, useState } from "react";

import {
  type SavedStep,
  SHINHAN_HOST_ESTIMATE_PATH,
  SHINHAN_HOST_REGISTRATION_PATH,
  ShinhanHostIntroductionDialog,
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

interface SavedHomeLinkProps {
  role: "host" | "guest";
}

export function SavedHomeLink({ role }: SavedHomeLinkProps) {
  const { pending, preparing, attempt } = useShinhanStorage();
  const label = role === "host" ? "호스트 홈 화면으로 돌아가기" : "게스트 홈화면으로 돌아가기";
  if (pending || preparing || attempt) {
    return (
      <span className={styles.homeLink} aria-disabled="true">
        {label}
      </span>
    );
  }
  return (
    <Link href={role === "host" ? "/shinhan/host" : "/shinhan/guest"} className={styles.homeLink}>
      {label}
    </Link>
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
        {estimate.region.districtUsed && <p>참고 지역: {estimate.region.districtUsed}</p>}
        {estimate.region.source === "seoul_config_average" && (
          <p>기본 예상 범위 · 서울 25개 구 설정값 평균 기준</p>
        )}
        {estimate.plannedFurnitureKeys.length > 0 && (
          <p>구매 예정 가구를 입주 전까지 제공하는 조건의 예상 금액입니다.</p>
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
      <SavedNavigationButton step="introduction">
        내 집에 맞는 시작 방법 알아보기
      </SavedNavigationButton>
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
  const { application, pending, preparing, sessionExpired, attempt, setStep } = useShinhanStorage();
  const [dialogOpen, setDialogOpen] = useState(false);
  const closeDialog = useCallback(() => setDialogOpen(false), []);
  if (application?.applicationType !== "HOST_ESTIMATE") return null;
  const blocked = pending || preparing || sessionExpired || Boolean(attempt);
  return (
    <div className={styles.introductionActions}>
      <p className={styles.introductionReassurance}>
        <span aria-hidden="true">✓</span> 소개서만 받아보고, 더 진행하지 않으셔도 괜찮아요.
      </p>
      <div className={styles.introductionActionRow}>
        <BtnCta
          className={styles.introductionPrimary}
          disabled={blocked}
          onClick={() =>
            application.introductionRequestedAt ? setStep("introComplete") : setDialogOpen(true)
          }
        >
          소개서만 먼저 받아보기 →
        </BtnCta>
        <Link href={SHINHAN_HOST_REGISTRATION_PATH} className={styles.registrationLink}>
          방 등록하기
        </Link>
      </div>
      <Link href="/shinhan/host" className={styles.introductionHome}>
        홈 화면으로 돌아가기
      </Link>
      {dialogOpen && <ShinhanHostIntroductionDialog onClose={closeDialog} />}
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
    refresh,
    refreshing,
    queryError,
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
          ? "이미 저장된 신청은 유지됩니다. 아래에서 신청 세션을 다시 준비해 주세요."
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
        <div>
          <BtnCta
            variant="stroke"
            loading={refreshing}
            disabled={pending || preparing}
            onClick={() => void refresh()}
          >
            신청 내역 다시 불러오기
          </BtnCta>
          {queryError && <p role="alert">{queryError.message}</p>}
        </div>
      )}
    </section>
  );
}

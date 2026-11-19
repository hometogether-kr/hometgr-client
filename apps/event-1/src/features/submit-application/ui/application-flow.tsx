"use client";

import Image from "next/image";

import { formatPhone, maskEmail, maskPhone } from "../model/application-display";
import { useApplicationFlow } from "../model/use-application-flow";

import styles from "./application-flow.module.css";

function focusHeading(element: HTMLHeadingElement | null) {
  element?.focus({ preventScroll: true });
}

export function ApplicationFlow() {
  const {
    stage,
    draft,
    errors,
    message,
    pending,
    closed,
    accepted,
    locked,
    setDraft,
    setErrors,
    setStage,
    setMessage,
    handleUniversitySubmit,
    handleApplicationSubmit,
    handleRestart,
    uncertain,
  } = useApplicationFlow();
  if (stage === "complete" && accepted) {
    return (
      <section className={styles.card} data-stage="complete" aria-labelledby="complete-title">
        <div className={styles.completeIcon}>
          <Image src="/event_1/images/check.svg" width={28} height={28} alt="" unoptimized />
        </div>
        <h2 id="complete-title" className={styles.completeTitle} tabIndex={-1} ref={focusHeading}>
          입주 혜택 안내 신청이
          <br />
          완료됐어요.
        </h2>
        <p className={styles.completeDescription}>
          남겨주신 연락처로
          <span className={styles.mobileBreak} />
          <span className={styles.desktopSpace}> </span>홈투게더 입주 가능한 집과
          <br />
          월세 지원 혜택을 안내해드릴게요.
        </p>
        <dl className={styles.receipt}>
          <div>
            <dt>대학교</dt>
            <dd>{accepted.universityCampus}</dd>
          </div>
          <div>
            <dt>전화번호</dt>
            <dd>{maskPhone(accepted.phone)}</dd>
          </div>
          <div>
            <dt>이메일</dt>
            <dd>{maskEmail(accepted.email)}</dd>
          </div>
        </dl>
        <button className={styles.cta} type="button" onClick={handleRestart}>
          처음으로
        </button>
      </section>
    );
  }

  return (
    <form
      className={styles.card}
      data-stage={stage}
      noValidate
      onSubmit={stage === "university" ? handleUniversitySubmit : handleApplicationSubmit}
      aria-labelledby="form-title"
      aria-busy={pending}
    >
      <div className={styles.steps}>
        <span>STEP {stage === "university" ? "01" : "02"}</span>
        <p>대학교 입력&nbsp; / &nbsp;연락처 입력</p>
      </div>
      {stage === "university" ? (
        <>
          <h2 className={styles.question} id="form-title" tabIndex={-1} key="university">
            거주를 원하는 대학교를
            <br />
            입력해 주세요.
          </h2>
          <div className={styles.field}>
            <label htmlFor="university-campus">대학교 · 캠퍼스</label>
            <input
              id="university-campus"
              name="universityCampus"
              placeholder="예) 인천대학교 송도캠퍼스"
              value={draft.universityCampus}
              maxLength={120}
              autoComplete="off"
              required
              aria-invalid={!!errors.universityCampus}
              aria-describedby="university-help"
              onChange={(event) => {
                setDraft({ ...draft, universityCampus: event.target.value });
                setErrors({});
              }}
            />
            <p
              id="university-help"
              className={errors.universityCampus ? styles.error : styles.helper}
            >
              {errors.universityCampus || "재학 중인 학교와 달라도 괜찮아요."}
            </p>
          </div>
          <button className={styles.cta} type="submit">
            다음&nbsp; →
          </button>
          <p className={`${styles.note} ${styles.mobileNote}`}>
            다음 단계에서 안내받을 연락처를 입력해요.
          </p>
        </>
      ) : (
        <>
          <h2
            className={styles.question}
            id="form-title"
            tabIndex={-1}
            ref={focusHeading}
            key="contact"
          >
            안내받을 연락처를
            <br />
            입력해 주세요.
          </h2>
          <button
            className={styles.university}
            type="button"
            disabled={locked}
            aria-label={`거주 희망 대학교 변경: ${draft.universityCampus}`}
            onClick={() => {
              setStage("university");
              setErrors({});
              setMessage("");
            }}
          >
            <span>거주를 원하는 대학교</span>
            <strong>{draft.universityCampus}</strong>
          </button>
          <div className={styles.contacts}>
            <div className={styles.field}>
              <label htmlFor="phone">안내받을 전화번호</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="010-0000-0000"
                value={draft.phone}
                maxLength={13}
                readOnly={locked}
                required
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? "phone-error" : undefined}
                onChange={(event) => {
                  setDraft({ ...draft, phone: formatPhone(event.target.value) });
                  setErrors({ ...errors, phone: undefined });
                }}
              />
              {errors.phone && (
                <p id="phone-error" className={styles.error}>
                  {errors.phone}
                </p>
              )}
            </div>
            <div className={styles.field}>
              <label htmlFor="email">이메일 주소</label>
              <input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="student@example.com"
                value={draft.email}
                maxLength={254}
                readOnly={locked}
                required
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                onChange={(event) => {
                  setDraft({ ...draft, email: event.target.value });
                  setErrors({ ...errors, email: undefined });
                }}
              />
              {errors.email && (
                <p id="email-error" className={styles.error}>
                  {errors.email}
                </p>
              )}
            </div>
          </div>
          <div>
            <label className={styles.consent}>
              <input
                id="consent"
                name="consentAccepted"
                type="checkbox"
                checked={draft.consentAccepted}
                disabled={locked}
                required
                aria-invalid={!!errors.consentAccepted}
                aria-describedby={errors.consentAccepted ? "consent-error" : undefined}
                onChange={(event) => {
                  setDraft({ ...draft, consentAccepted: event.target.checked });
                  setErrors({ ...errors, consentAccepted: undefined });
                }}
              />
              <span>[필수] 개인정보 수집·이용 동의</span>
            </label>
            {errors.consentAccepted && (
              <p className={styles.error} id="consent-error">
                {errors.consentAccepted}
              </p>
            )}
          </div>
          {message && (
            <p className={styles.error} role="alert">
              {message}
            </p>
          )}
          <button
            className={styles.cta}
            type="submit"
            disabled={pending || closed}
            aria-busy={pending}
          >
            {pending
              ? "접수 확인 중…"
              : uncertain
                ? "접수 결과 다시 확인하기"
                : "입주 혜택 안내받기"}
          </button>
          <p className={styles.note}>입주 가능한 집을 안내해드려요</p>
        </>
      )}
    </form>
  );
}

"use client";

import { type FormEvent, useId, useRef, useState } from "react";

import { useDialogBehavior } from "@/shared/lib/hooks";
import { BtnCta } from "@/shared/ui/btn-cta";
import { Checkbox } from "@/shared/ui/checkbox";
import { TextField } from "@/shared/ui/text-field";

import { shinhanContactSchema } from "../model/contact.schema";
import { formatShinhanPhone } from "../model/phone";
import { useShinhanStorage } from "../model/storage-context";
import { ShinhanPrivacyLink } from "./privacy-navigation";

import styles from "./host-introduction-dialog.module.css";

interface HostIntroductionDialogProps {
  onClose: () => void;
}

export function ShinhanHostIntroductionDialog({ onClose }: HostIntroductionDialogProps) {
  const storage = useShinhanStorage();
  const panelRef = useRef<HTMLDivElement>(null);
  const [phone, setPhone] = useState(() => formatShinhanPhone(storage.application?.phone ?? ""));
  const [requiredConsent, setRequiredConsent] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const id = useId();
  const blocked = storage.pending || storage.preparing || Boolean(storage.attempt);
  useDialogBehavior(true, onClose, panelRef);
  const parsed = shinhanContactSchema.safeParse({ phone, requiredConsent });
  const errors = attempted && !parsed.success ? parsed.error.flatten().fieldErrors : {};
  const matchesEstimate = parsed.success && parsed.data.phone === storage.application?.phone;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempted(true);
    if (blocked || !parsed.success || !matchesEstimate || storage.sessionExpired) return;
    if (await storage.requestIntroduction()) onClose();
  }

  return (
    <div className={styles.overlay}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        className={styles.panel}
      >
        <div className={styles.top}>
          <p>청년 소개서 알림</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="소개서 알림 닫기"
            className={styles.close}
          >
            ×
          </button>
        </div>
        <h2 id={`${id}-title`}>
          알림을 받을 전화번호를
          <br />
          입력해 주세요.
        </h2>
        <p className={styles.description}>
          우리 집 조건에 맞는 청년이 있으면
          <br />
          소개서 알림을 보내드릴게요.
        </p>
        <form onSubmit={(event) => void handleSubmit(event)} noValidate className={styles.form}>
          <TextField
            label="휴대폰 번호"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="010-0000-0000"
            value={phone}
            maxLength={13}
            disabled={blocked}
            onChange={(event) => setPhone(formatShinhanPhone(event.target.value))}
            error={
              errors.phone?.[0] ??
              (attempted && parsed.success && !matchesEstimate
                ? "예상 월세를 확인할 때 입력한 휴대폰 번호를 확인해 주세요."
                : undefined)
            }
          />
          <div>
            <div className={styles.consent}>
              <Checkbox
                id={`${id}-consent`}
                size="24"
                checked={requiredConsent}
                disabled={blocked}
                onChange={(event) => setRequiredConsent(event.target.checked)}
                aria-describedby={errors.requiredConsent ? `${id}-consent-error` : undefined}
                aria-invalid={Boolean(errors.requiredConsent) || undefined}
              />
              <label htmlFor={`${id}-consent`}>개인정보 수집·이용 동의 (필수)</label>
              <ShinhanPrivacyLink>내용 보기</ShinhanPrivacyLink>
            </div>
            {errors.requiredConsent && (
              <p className={styles.error} id={`${id}-consent-error`}>
                {errors.requiredConsent[0]}
              </p>
            )}
          </div>
          {storage.error && (
            <p role="alert" className={styles.error}>
              {storage.error.message}
            </p>
          )}
          <BtnCta
            type="submit"
            className={styles.submit}
            loading={storage.pending}
            disabled={blocked || storage.sessionExpired}
          >
            소개서 알림 신청하기
          </BtnCta>
          {storage.attempt && storage.error?.retryable && (
            <BtnCta
              variant="stroke"
              disabled={!storage.retryReady || storage.pending}
              onClick={() => void storage.retry()}
            >
              같은 요청으로 다시 시도
            </BtnCta>
          )}
        </form>
      </div>
    </div>
  );
}

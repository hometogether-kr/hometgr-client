"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useId, useRef, useState } from "react";

import { useDialogBehavior } from "@/shared/lib/hooks";
import { BtnCta } from "@/shared/ui/btn-cta";
import { Checkbox } from "@/shared/ui/checkbox";
import { TextField } from "@/shared/ui/text-field";

import { shinhanContactSchema } from "../model/contact.schema";
import { useShinhanIntake } from "../model/intake-context";
import { formatShinhanPhone } from "../model/phone";
import { useShinhanStorage } from "../model/storage-context";
import { ShinhanSessionRestart } from "./live-submit";
import { ShinhanPrivacyLink } from "./privacy-navigation";
import { ShinhanConsentStatus } from "./server-consent";

import styles from "./host-introduction-dialog.module.css";

interface HostIntroductionDialogProps {
  onClose: () => void;
}

export function ShinhanHostIntroductionDialog({ onClose }: HostIntroductionDialogProps) {
  const storage = useShinhanStorage();
  const { draft, updateDraft } = useShinhanIntake();
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const phone = draft?.phone ?? "";
  const requiredConsent = Boolean(
    draft?.requiredConsent && draft.requiredConsentVersion === storage.consents?.required.version,
  );
  const [attempted, setAttempted] = useState(false);
  const id = useId();
  const blocked = storage.pending || storage.preparing || Boolean(storage.attempt);
  useDialogBehavior(true, onClose, panelRef);
  const parsed = shinhanContactSchema.safeParse({ phone, requiredConsent });
  const errors = attempted && !parsed.success ? parsed.error.flatten().fieldErrors : {};

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempted(true);
    if (blocked || !parsed.success || storage.sessionExpired) return;
    const saved =
      storage.application?.applicationType === "HOST_ESTIMATE" &&
      storage.application.phone === parsed.data.phone
        ? await storage.requestIntroduction()
        : await storage.submitHostIntroduction();
    if (saved) {
      updateDraft((current) => ({ ...current, step: "introduction" }));
      router.push("/shinhan/application");
    }
  }

  async function retryIntroduction() {
    if (await storage.retry()) {
      updateDraft((current) => ({ ...current, step: "introduction" }));
      router.push("/shinhan/application");
    }
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
            onChange={(event) => {
              const phone = formatShinhanPhone(event.target.value);
              updateDraft((current) => ({ ...current, phone }));
            }}
            error={errors.phone?.[0] ?? storage.fieldErrors.phone?.[0]}
          />
          <div>
            <div className={styles.consent}>
              <Checkbox
                id={`${id}-consent`}
                size="24"
                checked={requiredConsent}
                disabled={blocked || !storage.consents}
                onChange={(event) => {
                  const requiredConsent = event.target.checked;
                  updateDraft((current) => ({
                    ...current,
                    requiredConsent,
                    requiredConsentVersion: requiredConsent
                      ? (storage.consents?.required.version ?? null)
                      : null,
                  }));
                }}
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
          <ShinhanConsentStatus />
          <ShinhanSessionRestart />
          {storage.error && (
            <p role="alert" className={styles.error}>
              {storage.error.message}
            </p>
          )}
          <BtnCta
            type="submit"
            className={styles.submit}
            loading={storage.pending}
            disabled={
              blocked || storage.sessionExpired || !storage.consents || !storage.submissionAvailable
            }
          >
            소개서 알림 신청하기
          </BtnCta>
          {storage.attempt && storage.error?.retryable && (
            <BtnCta
              variant="stroke"
              disabled={!storage.retryReady || storage.pending}
              onClick={() => {
                void retryIntroduction();
              }}
            >
              같은 요청으로 다시 시도
            </BtnCta>
          )}
          {storage.attempt &&
            storage.error &&
            !storage.error.retryable &&
            [400, 413, 422].includes(storage.error.status) && (
              <BtnCta variant="stroke" onClick={storage.clearRejectedAttempt}>
                입력 내용 다시 확인
              </BtnCta>
            )}
        </form>
      </div>
    </div>
  );
}

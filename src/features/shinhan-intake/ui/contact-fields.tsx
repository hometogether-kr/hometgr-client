"use client";

import { useId } from "react";

import { Checkbox } from "@/shared/ui/checkbox";
import { TextField } from "@/shared/ui/text-field";

import { useShinhanIntake } from "../model/intake-context";
import { formatShinhanPhone } from "../model/phone";
import { useShinhanStorage } from "../model/storage-context";
import { ShinhanPrivacyLink } from "./privacy-navigation";
import { ShinhanConsentStatus } from "./server-consent";

import styles from "./shinhan-intake.module.css";

interface ContactFieldsProps {
  errors?: { phone?: string; requiredConsent?: string };
}

export function ShinhanContactFields({ errors = {} }: ContactFieldsProps) {
  return (
    <div className={styles.contactFields}>
      <ShinhanPhoneField error={errors.phone} />
      <ShinhanRequiredConsentFields error={errors.requiredConsent} />
    </div>
  );
}

export function ShinhanPhoneField({
  error,
  label = "휴대폰 번호",
}: {
  error?: string;
  label?: string;
}) {
  const { draft, updateDraft } = useShinhanIntake();
  const { pending, preparing, attempt, fieldErrors } = useShinhanStorage();
  if (!draft) return null;
  return (
    <TextField
      label={label}
      type="tel"
      autoComplete="tel-national"
      inputMode="numeric"
      placeholder="010-0000-0000"
      value={draft.phone}
      maxLength={20}
      disabled={pending || preparing || attempt !== null}
      onChange={(event) => {
        const phone = formatShinhanPhone(event.target.value);
        updateDraft((current) => ({ ...current, phone }));
      }}
      error={error ?? fieldErrors.phone?.[0]}
      className={styles.phone}
    />
  );
}

export function ShinhanRequiredConsentFields({ error }: { error?: string }) {
  const { draft, updateDraft } = useShinhanIntake();
  const { pending, preparing, attempt, fieldErrors, consents } = useShinhanStorage();
  const consentId = useId();
  const consentError =
    error ?? fieldErrors.requiredConsent?.[0] ?? fieldErrors["requiredConsent.agreed"]?.[0];
  if (!draft) return null;
  return (
    <div>
      <div className={styles.consentRow}>
        <Checkbox
          id={consentId}
          size="24"
          checked={
            draft.requiredConsent && draft.requiredConsentVersion === consents?.required.version
          }
          disabled={!consents || pending || preparing || attempt !== null}
          onChange={(event) => {
            const requiredConsent = event.target.checked;
            updateDraft((current) => ({
              ...current,
              requiredConsent,
              requiredConsentVersion: requiredConsent ? (consents?.required.version ?? null) : null,
            }));
          }}
          aria-invalid={Boolean(consentError) || undefined}
          aria-describedby={consentError ? `${consentId}-error` : undefined}
          className={styles.checkbox}
        />
        <label htmlFor={consentId}>개인정보 수집·이용 동의 (필수)</label>
        <ShinhanPrivacyLink />
      </div>
      <ShinhanConsentStatus />
      {consentError && (
        <p id={`${consentId}-error`} className={styles.error}>
          {consentError}
        </p>
      )}
    </div>
  );
}

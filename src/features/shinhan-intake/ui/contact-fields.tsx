"use client";

import { useId } from "react";

import { Checkbox } from "@/shared/ui/checkbox";
import { TextField } from "@/shared/ui/text-field";

import { useShinhanIntake } from "../model/intake-context";
import { ShinhanPrivacyLink } from "./privacy-navigation";

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
  if (!draft) return null;
  return (
    <TextField
      label={label}
      type="tel"
      autoComplete="tel-national"
      inputMode="tel"
      placeholder="010-0000-0000"
      value={draft.phone}
      maxLength={20}
      onChange={(event) => {
        const phone = event.target.value;
        updateDraft((current) => ({ ...current, phone }));
      }}
      error={error}
      className={styles.phone}
    />
  );
}

export function ShinhanRequiredConsentFields({ error }: { error?: string }) {
  const { draft, updateDraft } = useShinhanIntake();
  const consentId = useId();
  if (!draft) return null;
  return (
    <div>
      <div className={styles.consentRow}>
        <Checkbox
          id={consentId}
          size="24"
          checked={draft.requiredConsent}
          onChange={(event) => {
            const requiredConsent = event.target.checked;
            updateDraft((current) => ({ ...current, requiredConsent }));
          }}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? `${consentId}-error` : undefined}
          className={styles.checkbox}
        />
        <label htmlFor={consentId}>개인정보 수집·이용 동의 (필수)</label>
        <ShinhanPrivacyLink />
      </div>
      {error && (
        <p id={`${consentId}-error`} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}

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
  const { draft, updateDraft } = useShinhanIntake();
  const consentId = useId();
  if (!draft) return null;
  return (
    <div className={styles.contactFields}>
      <TextField
        label="휴대폰 번호"
        type="tel"
        autoComplete="tel-national"
        inputMode="tel"
        placeholder="010-0000-0000"
        value={draft.phone}
        maxLength={20}
        onChange={(event) => updateDraft((current) => ({ ...current, phone: event.target.value }))}
        error={errors.phone}
        className={styles.phone}
      />
      <div className={styles.consentRow}>
        <Checkbox
          id={consentId}
          size="24"
          checked={draft.requiredConsent}
          onChange={(event) =>
            updateDraft((current) => ({ ...current, requiredConsent: event.target.checked }))
          }
          aria-invalid={Boolean(errors.requiredConsent) || undefined}
          aria-describedby={errors.requiredConsent ? `${consentId}-error` : undefined}
          className={styles.checkbox}
        />
        <label htmlFor={consentId}>개인정보 수집·이용 동의 (필수)</label>
        <ShinhanPrivacyLink />
      </div>
      {errors.requiredConsent && (
        <p id={`${consentId}-error`} className={styles.error}>
          {errors.requiredConsent}
        </p>
      )}
    </div>
  );
}

"use client";

import { type FormEvent, useId, useState } from "react";

import {
  shinhanContactSchema,
  shinhanHostRegistrationSchema,
  ShinhanLiveSubmit,
  ShinhanPhoneField,
  ShinhanRequiredConsentFields,
  ShinhanSavedApplicationNotice,
  useShinhanIntake,
  useShinhanStorage,
} from "@/features/shinhan-intake";
import { BtnCta } from "@/shared/ui/btn-cta";
import { SelectTile } from "@/shared/ui/select-tile";
import { TextField } from "@/shared/ui/text-field";

import styles from "./shinhan-host-registration.module.css";

export function HostRegistrationForm() {
  const { draft, updateDraft } = useShinhanIntake();
  const storage = useShinhanStorage();
  const [validationAttempted, setValidationAttempted] = useState(false);
  const [validatedSnapshot, setValidatedSnapshot] = useState<string | null>(null);
  const fieldId = useId();
  if (draft?.applicationType !== "HOST_REGISTRATION") return null;
  if (storage.application?.applicationType === "HOST_REGISTRATION")
    return <ShinhanSavedApplicationNotice />;
  const locked = storage.pending || storage.attempt !== null || storage.preparing;

  const contactResult = shinhanContactSchema.safeParse(draft);
  const conditionsResult = shinhanHostRegistrationSchema.safeParse(draft.values);
  const contactErrors =
    validationAttempted && !contactResult.success ? contactResult.error.flatten().fieldErrors : {};
  const conditionErrors =
    validationAttempted && !conditionsResult.success
      ? conditionsResult.error.flatten().fieldErrors
      : {};
  const ownershipError =
    conditionErrors.ownership?.[0] ?? storage.fieldErrors["input.ownership"]?.[0];
  const areaError = conditionErrors.areaRaw?.[0] ?? storage.fieldErrors["input.areaRaw"]?.[0];
  const currentSnapshot = JSON.stringify({
    phone: draft.phone,
    requiredConsent: draft.requiredConsent,
    values: draft.values,
  });

  function handleValidation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked) return;
    setValidationAttempted(true);
    setValidatedSnapshot(
      contactResult.success && conditionsResult.success ? currentSnapshot : null,
    );
  }

  function handleOwnershipChange(ownership: "OWNED" | "RENTED") {
    updateDraft((current) =>
      current.applicationType === "HOST_REGISTRATION"
        ? { ...current, values: { ...current.values, ownership } }
        : current,
    );
  }

  return (
    <form
      className={styles.form}
      noValidate
      onSubmit={handleValidation}
      aria-labelledby={`${fieldId}-title`}
    >
      <div className={styles.formHeading}>
        <h2 id={`${fieldId}-title`}>기본 정보</h2>
        <p>아래 세 가지만 알려주세요.</p>
      </div>
      <ShinhanPhoneField label="1. 전화번호" error={contactErrors.phone?.[0]} />
      <fieldset
        className={styles.ownership}
        aria-invalid={Boolean(ownershipError) || undefined}
        aria-describedby={ownershipError ? `${fieldId}-ownership-error` : undefined}
      >
        <legend>2. 집이 자가인가요?</legend>
        <div className={styles.choices}>
          <SelectTile
            disabled={locked}
            className={styles.choice}
            selected={draft.values.ownership === "OWNED"}
            onClick={() => handleOwnershipChange("OWNED")}
          >
            자가예요
          </SelectTile>
          <SelectTile
            disabled={locked}
            className={styles.choice}
            selected={draft.values.ownership === "RENTED"}
            onClick={() => handleOwnershipChange("RENTED")}
          >
            월세/전세
          </SelectTile>
        </div>
        {ownershipError && (
          <p className={styles.error} id={`${fieldId}-ownership-error`}>
            {ownershipError}
          </p>
        )}
      </fieldset>
      <div className={styles.location}>
        <TextField
          label="3. 집은 어디에 있나요?"
          className={styles.locationField}
          placeholder="예: 서울시 마포구 연남동"
          value={draft.values.areaRaw}
          maxLength={200}
          disabled={locked}
          aria-describedby={`${fieldId}-location-help`}
          error={areaError}
          onChange={(event) => {
            const areaRaw = event.target.value;
            updateDraft((current) =>
              current.applicationType === "HOST_REGISTRATION"
                ? { ...current, values: { ...current.values, areaRaw } }
                : current,
            );
          }}
        />
        <p className={styles.hint} id={`${fieldId}-location-help`}>
          시·군·구와 동까지만 입력해 주세요.
        </p>
      </div>
      <ShinhanRequiredConsentFields error={contactErrors.requiredConsent?.[0]} />
      <div className={styles.actions}>
        <ShinhanLiveSubmit className={styles.nextButton}>
          방 등록 신청 저장 (개발용)
        </ShinhanLiveSubmit>
        <p className={styles.hint}>입력하신 정보를 검토한 뒤, 심사 결과를 연락드려요.</p>
      </div>
      <div className={styles.validation}>
        <p id={`${fieldId}-submission-status`}>
          아래 버튼은 입력 형식만 확인하며 서버에 저장하지 않습니다.
        </p>
        <BtnCta variant="stroke" type="submit" className={styles.validateButton} disabled={locked}>
          입력 내용 확인 (개발용)
        </BtnCta>
        <p className={styles.validationMessage} role="status">
          {validatedSnapshot === currentSnapshot
            ? "입력 형식 확인 완료. 접수되지는 않았습니다."
            : validationAttempted && (!contactResult.success || !conditionsResult.success)
              ? "입력 내용을 확인해 주세요. 접수되지는 않았습니다."
              : "입력 형식만 확인하며 신청을 저장하지 않습니다."}
        </p>
      </div>
    </form>
  );
}

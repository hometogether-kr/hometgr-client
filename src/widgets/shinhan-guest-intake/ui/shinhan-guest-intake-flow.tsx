"use client";

import { type FormEvent, type ReactNode, useId, useState } from "react";

import { useBetaFlowInput } from "@/features/beta-tracking";
import {
  ShinhanAnalysisProgress,
  shinhanContactSchema,
  ShinhanGuestBudgetField,
  ShinhanGuestBudgetRangeField,
  shinhanGuestBudgetSchema,
  type ShinhanGuestBudgetValues,
  shinhanGuestDemandSchema,
  type ShinhanGuestDemandValues,
  ShinhanGuestProgress,
  ShinhanGuestRegionField,
  ShinhanLiveSubmit,
  ShinhanMoveInDateField,
  ShinhanMoveInTimingField,
  ShinhanPhoneField,
  ShinhanRequiredConsentFields,
  ShinhanSavedApplicationNotice,
  useShinhanIntake,
  useShinhanStorage,
} from "@/features/shinhan-intake";
import { BtnCta } from "@/shared/ui/btn-cta";
import { SelectTile } from "@/shared/ui/select-tile";
import { TextField } from "@/shared/ui/text-field";

import styles from "./shinhan-guest-intake-flow.module.css";

interface GuestIntakeFlowProps {
  applicationType: "GUEST_BUDGET" | "GUEST_DEMAND";
  introduction: ReactNode;
  examples: ReactNode;
}

const contractTerms = [
  ...Array.from({ length: 12 }, (_, index) => ({
    value: `MONTH_${index + 1}`,
    label: `${index + 1}개월`,
  })),
  { value: "MONTHS_12_PLUS", label: "12개월 이상" },
];

export function ShinhanGuestIntakeFlow({
  applicationType,
  introduction,
  examples,
}: GuestIntakeFlowProps) {
  const { draft, updateDraft } = useShinhanIntake();
  const storage = useShinhanStorage();
  const { trackValidInput, markResultReady } = useBetaFlowInput(applicationType, {
    enabled:
      draft?.applicationType === applicationType &&
      storage.application?.applicationType !== applicationType,
  });
  const locked = storage.pending || storage.attempt !== null || storage.preparing;
  const [conditionsAttempted, setConditionsAttempted] = useState(false);
  const [contactAttempted, setContactAttempted] = useState(false);
  const id = useId();
  if (
    !draft ||
    draft.applicationType !== applicationType ||
    (draft.applicationType !== "GUEST_BUDGET" && draft.applicationType !== "GUEST_DEMAND")
  )
    return null;
  if (storage.application?.applicationType === applicationType)
    return <ShinhanSavedApplicationNotice />;

  const isBudget = draft.applicationType === "GUEST_BUDGET";
  const conditionsResult = isBudget
    ? shinhanGuestBudgetSchema.safeParse(draft.values)
    : shinhanGuestDemandSchema.safeParse(draft.values);
  const errors: Record<string, string> =
    conditionsAttempted && !conditionsResult.success
      ? Object.fromEntries(
          conditionsResult.error.issues.map((issue) => [issue.path.join("."), issue.message]),
        )
      : {};
  const contactResult = shinhanContactSchema.safeParse(draft);
  const contactErrors =
    contactAttempted && !contactResult.success ? contactResult.error.flatten().fieldErrors : {};

  function updateBudget(values: Partial<ShinhanGuestBudgetValues>) {
    updateDraft((current) =>
      current.applicationType === "GUEST_BUDGET"
        ? { ...current, values: { ...current.values, ...values } }
        : current,
    );
    const fields = shinhanGuestBudgetSchema.shape;
    if (
      fields.budgetMonthlyKrw.safeParse(values.budgetMonthlyKrw).success ||
      fields.desiredRegionRaw.safeParse(values.desiredRegionRaw).success ||
      fields.moveInDate.safeParse(values.moveInDate).success
    ) {
      trackValidInput();
    }
  }

  function updateDemand(values: Partial<ShinhanGuestDemandValues>) {
    updateDraft((current) =>
      current.applicationType === "GUEST_DEMAND"
        ? { ...current, values: { ...current.values, ...values } }
        : current,
    );
    const fields = shinhanGuestDemandSchema.shape;
    if (
      fields.desiredRegionRaw.safeParse(values.desiredRegionRaw).success ||
      fields.budgetMinKrw.safeParse(values.budgetMinKrw).success ||
      fields.budgetMaxKrw.safeParse(values.budgetMaxKrw).success ||
      fields.moveInDate.safeParse(values.moveInDate).success ||
      fields.contractTermCode.safeParse(values.contractTermCode).success ||
      fields.gender.safeParse(values.gender).success
    ) {
      trackValidInput();
    }
  }

  function handleConditionsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked) return;
    setConditionsAttempted(true);
    if (!conditionsResult.success) return;
    updateDraft((current) => ({ ...current, step: "analysis" }));
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function handleContactCheck(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked) return;
    setContactAttempted(true);
  }

  function handleEditConditions() {
    if (locked) return;
    updateDraft((current) => ({ ...current, step: "conditions" }));
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  return (
    <>
      <ShinhanGuestProgress
        current={draft.step === "conditions" ? 1 : draft.step === "analysis" ? 2 : 3}
      />
      {draft.step === "analysis" ? (
        <ShinhanAnalysisProgress
          mode="guest"
          onComplete={() => updateDraft((current) => ({ ...current, step: "contact" }))}
        />
      ) : draft.step === "contact" ? (
        <div className={styles.contactStep}>
          <header className={styles.contactHeading}>
            <span className={styles.contactEyebrow}>내 조건에 맞는 집</span>
            <h1>
              입력하신 조건이라면, <em>이런 집</em>에서 거주하실 수 있어요!
            </h1>
            <p>사진은 공간 예시입니다. 전화번호를 남겨 주시면 실제 입주 조건을 안내해 드릴게요.</p>
          </header>
          {examples}
          <form
            className={styles.contactForm}
            noValidate
            onSubmit={handleContactCheck}
            aria-label={isBudget ? "예산 매칭 연락처 입력" : "수요조사 연락처 입력"}
          >
            <ShinhanPhoneField
              label={
                isBudget
                  ? "상세한 매물 정보를 받을 전화번호를 입력해주세요!"
                  : "입주 조건을 받으려면 전화번호를 남겨 주세요"
              }
              error={contactErrors.phone?.[0]}
              onValidInput={trackValidInput}
            />
            <ShinhanRequiredConsentFields
              error={contactErrors.requiredConsent?.[0]}
              label="[필수] 개인정보 수집·이용에 동의합니다"
            />
            <ShinhanLiveSubmit onSaved={markResultReady} className={styles.cta} notice="">
              입주조건 확인하기 →
            </ShinhanLiveSubmit>
          </form>
          <button
            type="button"
            className={styles.back}
            onClick={handleEditConditions}
            disabled={locked}
          >
            ← {isBudget ? "예산과 희망 지역 다시 입력하기" : "위치·월세·성별 다시 입력하기"}
          </button>
        </div>
      ) : (
        <div className={styles.columns}>
          {introduction}
          <form
            className={styles.form}
            noValidate
            onSubmit={handleConditionsSubmit}
            aria-label={isBudget ? "예산 매칭 조건 입력" : "수요조사 조건 입력"}
          >
            <fieldset disabled={locked} className="contents">
              {draft.applicationType === "GUEST_BUDGET" ? (
                <>
                  <ShinhanGuestBudgetField
                    value={draft.values.budgetMonthlyKrw}
                    onChange={(budgetMonthlyKrw) => updateBudget({ budgetMonthlyKrw })}
                    error={errors.budgetMonthlyKrw}
                  />
                  <TextField
                    className={styles.budgetRegion}
                    label="어느 지역에서 살고 싶으세요?"
                    placeholder="예: 노원구, 공릉동, 서울과기대 근처"
                    value={draft.values.desiredRegionRaw}
                    onChange={(event) => updateBudget({ desiredRegionRaw: event.target.value })}
                    maxLength={200}
                    error={errors.desiredRegionRaw}
                  />
                  <ShinhanMoveInTimingField
                    value={draft.values.moveInDate}
                    timing={draft.values.moveInTiming}
                    onChange={(moveInDate) => updateBudget({ moveInDate })}
                    onTimingChange={(moveInTiming, moveInDate) =>
                      updateBudget({ moveInTiming, moveInDate })
                    }
                    error={errors.moveInDate}
                  />
                </>
              ) : (
                <>
                  <ShinhanGuestRegionField
                    label="1. 어디에서 살고 싶으세요?"
                    value={draft.values.desiredRegionRaw}
                    onChange={(desiredRegionRaw) => updateDemand({ desiredRegionRaw })}
                    error={errors.desiredRegionRaw}
                  />
                  <ShinhanGuestBudgetRangeField
                    min={draft.values.budgetMinKrw}
                    max={draft.values.budgetMaxKrw}
                    onMinChange={(budgetMinKrw) => updateDemand({ budgetMinKrw })}
                    onMaxChange={(budgetMaxKrw) => updateDemand({ budgetMaxKrw })}
                    minError={errors.budgetMinKrw}
                    maxError={errors.budgetMaxKrw}
                  />
                  <ShinhanMoveInDateField
                    value={draft.values.moveInDate}
                    onChange={(moveInDate) => updateDemand({ moveInDate })}
                    error={errors.moveInDate}
                  />
                  <div className={styles.termField}>
                    <label htmlFor={`${id}-term`}>4. 얼마나 거주할 예정인가요?</label>
                    <select
                      id={`${id}-term`}
                      value={draft.values.contractTermCode}
                      onChange={(event) => updateDemand({ contractTermCode: event.target.value })}
                      aria-invalid={Boolean(errors.contractTermCode) || undefined}
                      aria-describedby={errors.contractTermCode ? `${id}-term-error` : undefined}
                    >
                      <option value="" disabled>
                        계약기간을 선택해 주세요
                      </option>
                      {contractTerms.map((term) => (
                        <option key={term.value} value={term.value}>
                          {term.label}
                        </option>
                      ))}
                    </select>
                    {errors.contractTermCode && (
                      <p id={`${id}-term-error`} role="alert" className={styles.error}>
                        {errors.contractTermCode}
                      </p>
                    )}
                  </div>
                  <fieldset
                    className={styles.genderField}
                    aria-describedby={errors.gender ? `${id}-gender-error` : undefined}
                  >
                    <legend>5. 성별을 알려 주세요</legend>
                    <div className={styles.genderChoices}>
                      <SelectTile
                        selected={draft.values.gender === "FEMALE"}
                        onClick={() => updateDemand({ gender: "FEMALE" })}
                        className={styles.genderChoice}
                      >
                        여성
                      </SelectTile>
                      <SelectTile
                        selected={draft.values.gender === "MALE"}
                        onClick={() => updateDemand({ gender: "MALE" })}
                        className={styles.genderChoice}
                      >
                        남성
                      </SelectTile>
                    </div>
                    {errors.gender && (
                      <p id={`${id}-gender-error`} role="alert" className={styles.error}>
                        {errors.gender}
                      </p>
                    )}
                  </fieldset>
                </>
              )}
              <div className={styles.actions}>
                <BtnCta type="submit" className={styles.cta}>
                  {isBudget ? "내 예산에 맞는 아파트 찾기 →" : "내 조건에 맞는 방 둘러보기"}
                </BtnCta>
                <p className={styles.notice}>예산과 희망 지역에 맞는 아파트 개인방을 확인해요.</p>
              </div>
            </fieldset>
          </form>
        </div>
      )}
    </>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useId, useState } from "react";

import {
  SHINHAN_GUEST_FOLLOWUP_PATH,
  shinhanContactSchema,
  ShinhanGuestBudgetField,
  ShinhanGuestBudgetRangeField,
  shinhanGuestBudgetSchema,
  type ShinhanGuestBudgetValues,
  shinhanGuestDemandSchema,
  type ShinhanGuestDemandValues,
  ShinhanGuestRegionField,
  ShinhanLiveSubmit,
  ShinhanMoveInDateField,
  ShinhanPhoneField,
  ShinhanPrivacyLink,
  ShinhanRequiredConsentFields,
  ShinhanSavedApplicationNotice,
  useShinhanIntake,
  useShinhanStorage,
} from "@/features/shinhan-intake";
import { BtnCta } from "@/shared/ui/btn-cta";
import { SelectTile } from "@/shared/ui/select-tile";

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
  const { draft, updateDraft, startGuestFollowup } = useShinhanIntake();
  const storage = useShinhanStorage();
  const locked = storage.pending || storage.attempt !== null || storage.preparing;
  const router = useRouter();
  const [conditionsAttempted, setConditionsAttempted] = useState(false);
  const [contactAttempted, setContactAttempted] = useState(false);
  const [verifiedContact, setVerifiedContact] = useState<string | null>(null);
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
  const contactSnapshot = JSON.stringify([draft.phone, draft.requiredConsent]);

  function updateBudget(values: Partial<ShinhanGuestBudgetValues>) {
    updateDraft((current) =>
      current.applicationType === "GUEST_BUDGET"
        ? { ...current, values: { ...current.values, ...values } }
        : current,
    );
  }

  function updateDemand(values: Partial<ShinhanGuestDemandValues>) {
    updateDraft((current) =>
      current.applicationType === "GUEST_DEMAND"
        ? { ...current, values: { ...current.values, ...values } }
        : current,
    );
  }

  function handleConditionsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked) return;
    setConditionsAttempted(true);
    if (!conditionsResult.success) return;
    updateDraft((current) => ({ ...current, step: "contact" }));
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function handleContactCheck(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked) return;
    setContactAttempted(true);
    setVerifiedContact(contactResult.success ? contactSnapshot : null);
  }

  function handleEditConditions() {
    if (locked) return;
    updateDraft((current) => ({ ...current, step: "conditions" }));
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function handleFollowupPreview() {
    if (locked) return;
    setContactAttempted(true);
    if (!contactResult.success) return;
    if (startGuestFollowup()) {
      router.push(SHINHAN_GUEST_FOLLOWUP_PATH);
      return;
    }
    // 연락처 입력 중 날짜가 바뀌어 입주일이 과거가 되면 조건을 다시 확인한다.
    setConditionsAttempted(true);
    updateDraft((current) => ({ ...current, step: "conditions" }));
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  return (
    <>
      <ol className={styles.progress} aria-label="신청 진행 단계">
        <li aria-current={draft.step === "conditions" ? "step" : undefined}>01 조건 입력</li>
        <li aria-current={draft.step === "contact" ? "step" : undefined}>02 공간 예시·연락처</li>
      </ol>
      {draft.step === "contact" ? (
        <div className={styles.contactStep}>
          <header className={styles.contactHeading}>
            <h1>
              {isBudget ? (
                <>
                  이런 집에서 살 수 있는 곳을 <em>찾았어요</em>
                </>
              ) : (
                <>
                  입력하신 조건이라면,
                  <br />
                  <em>이런 집</em>에서 거주하실 수 있어요!
                </>
              )}
            </h1>
            <p>
              {isBudget
                ? "사진으로 공간을 먼저 둘러보고, 상세조건 안내를 신청해 보세요."
                : "사진은 공간 예시입니다. 전화번호를 남겨 주시면 실제 입주 조건을 안내해 드릴게요."}
            </p>
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
                  ? "상세조건을 안내받을 휴대폰 번호"
                  : "입주 조건을 받으려면 전화번호를 남겨 주세요"
              }
              error={contactErrors.phone?.[0]}
            />
            <ShinhanRequiredConsentFields error={contactErrors.requiredConsent?.[0]} />
            <ShinhanLiveSubmit className={styles.cta}>
              {isBudget ? "상세조건 안내받기" : "입주조건 확인하기"}
            </ShinhanLiveSubmit>
            <BtnCta type="submit" variant="stroke" className={styles.checkButton} disabled={locked}>
              입력 내용 확인 (개발용)
            </BtnCta>
            <p role="status" className={styles.notice}>
              {verifiedContact === contactSnapshot
                ? "입력 형식을 확인했어요. 신청 저장 성공 전에는 접수가 완료되지 않습니다."
                : "‘입력 내용 확인’ 버튼은 형식만 확인하며 신청을 저장하지 않습니다."}
            </p>
            {process.env.NODE_ENV === "development" && (
              <BtnCta
                type="button"
                variant="stroke"
                className={styles.checkButton}
                onClick={handleFollowupPreview}
                disabled={locked}
              >
                신청 후 화면 미리보기 (개발용)
              </BtnCta>
            )}
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
                  <ShinhanGuestRegionField
                    label="2. 희망하는 위치"
                    value={draft.values.desiredRegionRaw}
                    onChange={(desiredRegionRaw) => updateBudget({ desiredRegionRaw })}
                    error={errors.desiredRegionRaw}
                  />
                  <ShinhanMoveInDateField
                    value={draft.values.moveInDate}
                    onChange={(moveInDate) => updateBudget({ moveInDate })}
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
                  {isBudget ? "내 예산에 맞는 아파트 찾기" : "내 조건에 맞는 방 둘러보기"}
                </BtnCta>
                <p className={styles.notice}>
                  다음 화면에서 공통 공간 예시와 연락처 입력을 확인할 수 있어요.
                </p>
                <ShinhanPrivacyLink>개인정보 수집·이용 전문 보기</ShinhanPrivacyLink>
              </div>
            </fieldset>
          </form>
        </div>
      )}
    </>
  );
}

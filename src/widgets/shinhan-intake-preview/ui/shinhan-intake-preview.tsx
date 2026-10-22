"use client";

import { type FormEvent, useState } from "react";

import {
  SHINHAN_APPLICATION_LABELS,
  SHINHAN_APPLICATION_TYPES,
  type ShinhanApplicationType,
  ShinhanContactFields,
  shinhanContactSchema,
  ShinhanPrivacyLink,
  useShinhanIntake,
} from "@/features/shinhan-intake";
import { BtnCta } from "@/shared/ui/btn-cta";
import { SelectTile } from "@/shared/ui/select-tile";

import { PreviewConditions, PreviewSelectionMemory } from "./preview-conditions";

import styles from "./shinhan-intake-preview.module.css";

interface ContactErrors {
  phone?: string;
  requiredConsent?: string;
}

interface ContactValidation {
  phone: string;
  requiredConsent: boolean;
  errors: ContactErrors;
  isValid: boolean;
}

export function ShinhanIntakePreview() {
  const { draft, startDraft, updateDraft } = useShinhanIntake();
  const [validation, setValidation] = useState<ContactValidation | null>(null);
  const currentValidation =
    draft &&
    validation?.phone === draft.phone &&
    validation.requiredConsent === draft.requiredConsent
      ? validation
      : null;

  function handleDraftStart(applicationType: ShinhanApplicationType) {
    startDraft(applicationType);
    setValidation(null);
  }

  function handleContactCheck(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    const result = shinhanContactSchema.safeParse({
      phone: draft.phone,
      requiredConsent: draft.requiredConsent,
    });
    const errors: ContactErrors = {};
    if (!result.success) {
      for (const issue of result.error.issues) {
        if (issue.path[0] === "phone") errors.phone ??= issue.message;
        if (issue.path[0] === "requiredConsent") errors.requiredConsent ??= issue.message;
      }
    }
    setValidation({
      phone: draft.phone,
      requiredConsent: draft.requiredConsent,
      errors,
      isValid: result.success,
    });
  }

  return (
    <section className={styles.preview} aria-labelledby="shinhan-intake-preview-heading">
      <div className={styles.banner}>
        <p className={styles.eyebrow}>개발 전용 · 실제 신청 아님</p>
        <h1 id="shinhan-intake-preview-heading">신청 공통 기반 미리보기</h1>
        <p>
          개인정보 전문 복귀와 작성 상태 보존을 확인하는 화면입니다. 입력 내용은 서버에 저장하거나
          전송하지 않으며, 신청 접수도 이루어지지 않습니다.
        </p>
      </div>

      <section className={styles.typeSelection} aria-labelledby="shinhan-preview-type-heading">
        <h2 id="shinhan-preview-type-heading">검증할 신청 유형</h2>
        <p className={styles.help}>
          유형 버튼을 누르면 해당 유형의 새 빈 초안으로 시작합니다. 현재 입력은 새 초안에 이어지지
          않습니다.
        </p>
        <div className={styles.types}>
          {SHINHAN_APPLICATION_TYPES.map((applicationType) => (
            <SelectTile
              key={applicationType}
              selected={draft?.applicationType === applicationType}
              onClick={() => handleDraftStart(applicationType)}
            >
              {SHINHAN_APPLICATION_LABELS[applicationType]}
            </SelectTile>
          ))}
        </div>
      </section>

      {!draft ? (
        <p className={styles.empty}>유형을 선택해 작성 상태 보존을 확인해 주세요.</p>
      ) : (
        <div className={styles.draft}>
          <p className={styles.draftLabel}>{SHINHAN_APPLICATION_LABELS[draft.applicationType]}</p>
          <ol className={styles.steps} aria-label="개발 검증 단계">
            <li aria-current={draft.step === "conditions" ? "step" : undefined}>1. 조건·선택값</li>
            <li aria-current={draft.step === "contact" ? "step" : undefined}>2. 연락처·동의</li>
          </ol>
          <p className={styles.help}>
            아래 두 단계는 공통 기반 검증용 구성입니다. 실제 고객 신청 화면 전체를 나타내지
            않습니다.
          </p>

          {draft.step === "conditions" ? (
            <section className={styles.stage} aria-labelledby="shinhan-preview-conditions-heading">
              <h2 id="shinhan-preview-conditions-heading">검증 1단계: 조건·선택값</h2>
              <PreviewConditions />
              <PreviewSelectionMemory />
              <div className={styles.privacyRow}>
                <span>작성 중인 상태로 개인정보 전문 확인</span>
                <ShinhanPrivacyLink />
              </div>
              <BtnCta
                className={styles.fullWidth}
                onClick={() => {
                  setValidation(null);
                  updateDraft((current) => ({ ...current, step: "contact" }));
                }}
              >
                검증 2단계로
              </BtnCta>
            </section>
          ) : (
            <form className={styles.stage} onSubmit={handleContactCheck} noValidate>
              <h2>검증 2단계: 연락처·동의</h2>
              <ShinhanContactFields errors={currentValidation?.errors} />
              <div className={styles.actions}>
                <BtnCta
                  variant="stroke"
                  onClick={() => {
                    setValidation(null);
                    updateDraft((current) => ({ ...current, step: "conditions" }));
                  }}
                >
                  검증 1단계로
                </BtnCta>
                <BtnCta type="submit">입력 형식 확인</BtnCta>
              </div>
              <div className={styles.validationMessage} aria-live="polite">
                {currentValidation?.isValid && <p>입력 형식 확인 완료. 접수되지는 않았습니다.</p>}
                {currentValidation && !currentValidation.isValid && (
                  <p>입력한 내용을 유지했습니다. 각 항목의 안내를 확인해 주세요.</p>
                )}
              </div>
              <BtnCta disabled className={styles.fullWidth}>
                접수 기능은 다음 단계에서 연결
              </BtnCta>
            </form>
          )}
        </div>
      )}
    </section>
  );
}

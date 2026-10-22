"use client";

import { useId } from "react";

import { useShinhanIntake } from "@/features/shinhan-intake";
import { BtnCta } from "@/shared/ui/btn-cta";
import { Checkbox } from "@/shared/ui/checkbox";
import { SelectTile } from "@/shared/ui/select-tile";
import { TextField } from "@/shared/ui/text-field";

import styles from "./shinhan-intake-preview.module.css";

const furnitureOptions = [
  { value: "OWNED", label: "이미 있어요" },
  { value: "PLANNED", label: "준비할 예정이에요" },
  { value: "NONE", label: "없어요" },
] as const;

export function PreviewConditions() {
  const { draft, updateDraft } = useShinhanIntake();
  const contractId = useId();
  if (!draft) return null;

  switch (draft.applicationType) {
    case "HOST_REGISTRATION":
      return (
        <div className={styles.fields}>
          <TextField
            label="대략적인 위치"
            value={draft.values.areaRaw}
            placeholder="예) 서울 노원구 상계동"
            onChange={(event) =>
              updateDraft((current) =>
                current.applicationType === "HOST_REGISTRATION"
                  ? { ...current, values: { ...current.values, areaRaw: event.target.value } }
                  : current,
              )
            }
          />
          <fieldset className={styles.fieldset}>
            <legend>주거 형태</legend>
            <div className={styles.choices}>
              {[
                { value: "OWNED", label: "자가" },
                { value: "RENTED", label: "월세·전세" },
              ].map((item) => (
                <SelectTile
                  key={item.value}
                  selected={draft.values.ownership === item.value}
                  onClick={() =>
                    updateDraft((current) =>
                      current.applicationType === "HOST_REGISTRATION"
                        ? {
                            ...current,
                            values: {
                              ...current.values,
                              ownership: item.value === "OWNED" ? "OWNED" : "RENTED",
                            },
                          }
                        : current,
                    )
                  }
                >
                  {item.label}
                </SelectTile>
              ))}
            </div>
          </fieldset>
        </div>
      );
    case "HOST_ESTIMATE":
      return (
        <div className={styles.fields}>
          <p className={styles.help}>
            기본 주소는 후속 견적 화면에서 기존 카카오 주소검색으로 연결합니다. 이 미리보기에서는
            주소를 직접 입력하지 않습니다.
          </p>
          <TextField
            label="동 (선택)"
            value={draft.values.buildingDong}
            placeholder="예) 101동"
            onChange={(event) =>
              updateDraft((current) =>
                current.applicationType === "HOST_ESTIMATE"
                  ? { ...current, values: { ...current.values, buildingDong: event.target.value } }
                  : current,
              )
            }
          />
          <TextField
            label="호수 (선택)"
            value={draft.values.unitHo}
            placeholder="예) 1201호"
            onChange={(event) =>
              updateDraft((current) =>
                current.applicationType === "HOST_ESTIMATE"
                  ? { ...current, values: { ...current.values, unitHo: event.target.value } }
                  : current,
              )
            }
          />
          <fieldset className={styles.fieldset}>
            <legend>침대 준비 상태</legend>
            <div className={styles.choices}>
              {furnitureOptions.map((item) => (
                <SelectTile
                  key={item.value}
                  selected={draft.values.furniture.bed === item.value}
                  onClick={() =>
                    updateDraft((current) =>
                      current.applicationType === "HOST_ESTIMATE"
                        ? {
                            ...current,
                            values: {
                              ...current.values,
                              furniture: { ...current.values.furniture, bed: item.value },
                            },
                          }
                        : current,
                    )
                  }
                >
                  {item.label}
                </SelectTile>
              ))}
            </div>
          </fieldset>
        </div>
      );
    case "GUEST_BUDGET": {
      const budget = draft.values.budgetMonthlyKrw;
      const isBudgetInvalid =
        budget !== null && (budget < 200000 || budget > 1000000 || budget % 10000 !== 0);
      return (
        <div className={styles.fields}>
          <TextField
            label="희망하는 대학 또는 지역"
            value={draft.values.desiredRegionRaw}
            placeholder="예) 서울과학기술대학교, 공릉역"
            onChange={(event) =>
              updateDraft((current) =>
                current.applicationType === "GUEST_BUDGET"
                  ? {
                      ...current,
                      values: { ...current.values, desiredRegionRaw: event.target.value },
                    }
                  : current,
              )
            }
          />
          <TextField
            label="월세 예산 (만 원)"
            type="number"
            inputMode="numeric"
            min={20}
            max={100}
            step={1}
            value={budget === null ? "" : budget / 10000}
            placeholder="20~100"
            error={
              isBudgetInvalid ? "월 예산은 20~100만 원에서 1만 원 단위로 입력해 주세요." : undefined
            }
            onChange={(event) => {
              const amount = event.target.valueAsNumber;
              updateDraft((current) =>
                current.applicationType === "GUEST_BUDGET"
                  ? {
                      ...current,
                      values: {
                        ...current.values,
                        budgetMonthlyKrw: Number.isFinite(amount) ? amount * 10000 : null,
                      },
                    }
                  : current,
              );
            }}
          />
        </div>
      );
    }
    case "GUEST_DEMAND":
      return (
        <div className={styles.fields}>
          <TextField
            label="희망하는 대학 또는 지역"
            value={draft.values.desiredRegionRaw}
            placeholder="예) 서울과학기술대학교, 공릉역"
            onChange={(event) =>
              updateDraft((current) =>
                current.applicationType === "GUEST_DEMAND"
                  ? {
                      ...current,
                      values: { ...current.values, desiredRegionRaw: event.target.value },
                    }
                  : current,
              )
            }
          />
          <div className={styles.selectField}>
            <label htmlFor={contractId}>희망 계약기간</label>
            <select
              id={contractId}
              value={draft.values.contractTermCode}
              onChange={(event) =>
                updateDraft((current) =>
                  current.applicationType === "GUEST_DEMAND"
                    ? {
                        ...current,
                        values: { ...current.values, contractTermCode: event.target.value },
                      }
                    : current,
                )
              }
            >
              <option value="">선택해 주세요</option>
              {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
                <option key={month} value={`MONTH_${month}`}>
                  {month}개월
                </option>
              ))}
              <option value="MONTHS_12_PLUS">12개월 이상</option>
            </select>
          </div>
          <fieldset className={styles.fieldset}>
            <legend>성별</legend>
            <div className={styles.choices}>
              {[
                { value: "FEMALE", label: "여성" },
                { value: "MALE", label: "남성" },
              ].map((item) => (
                <SelectTile
                  key={item.value}
                  selected={draft.values.gender === item.value}
                  onClick={() =>
                    updateDraft((current) =>
                      current.applicationType === "GUEST_DEMAND"
                        ? {
                            ...current,
                            values: {
                              ...current.values,
                              gender: item.value === "FEMALE" ? "FEMALE" : "MALE",
                            },
                          }
                        : current,
                    )
                  }
                >
                  {item.label}
                </SelectTile>
              ))}
            </div>
          </fieldset>
        </div>
      );
  }
}

export function PreviewSelectionMemory() {
  const { draft, updateDraft } = useShinhanIntake();
  const consentId = useId();
  if (!draft || draft.applicationType === "HOST_REGISTRATION") return null;

  const concernOptions = [
    { code: "PRIVACY", label: "개인 공간" },
    draft.applicationType === "HOST_ESTIMATE"
      ? { code: "PROCESS", label: "시작 절차" }
      : { code: "HOST_RELATIONSHIP", label: "호스트와의 관계" },
  ];

  return (
    <section className={styles.memoryCheck} aria-labelledby={`${consentId}-heading`}>
      <h3 id={`${consentId}-heading`}>복수 선택·선택 동의 보존 확인</h3>
      <p className={styles.help}>
        개발 검증용 항목입니다. 실제 걱정 선택 화면의 순서와 제출 기능은 후속 단계에서 연결합니다.
      </p>
      <fieldset className={styles.fieldset}>
        <legend>확인할 항목 (복수 선택)</legend>
        <div className={styles.choices}>
          {concernOptions.map((item) => (
            <SelectTile
              key={item.code}
              selected={draft.concernCodes.includes(item.code)}
              onClick={() =>
                updateDraft((current) => ({
                  ...current,
                  concernCodes: current.concernCodes.includes(item.code)
                    ? current.concernCodes.filter((code) => code !== item.code)
                    : [...current.concernCodes, item.code],
                }))
              }
            >
              {item.label}
            </SelectTile>
          ))}
        </div>
      </fieldset>
      <div className={styles.checkboxRow}>
        <Checkbox
          id={consentId}
          size="24"
          checked={draft.optionalConsent === true}
          className={styles.checkbox}
          aria-describedby={`${consentId}-status`}
          onChange={(event) =>
            updateDraft((current) => ({ ...current, optionalConsent: event.target.checked }))
          }
        />
        <label htmlFor={consentId}>선택정보 동의 상태 확인 (개발 검증용)</label>
      </div>
      <p className={styles.help} id={`${consentId}-status`}>
        현재 상태:{" "}
        {draft.optionalConsent === null ? "미응답" : draft.optionalConsent ? "동의" : "미동의"}
      </p>
      <BtnCta
        variant="stroke"
        onClick={() => updateDraft((current) => ({ ...current, optionalConsent: null }))}
      >
        선택 동의를 미응답으로 되돌리기
      </BtnCta>
    </section>
  );
}

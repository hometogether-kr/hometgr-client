"use client";

import { type FormEvent, type ReactNode, useCallback, useState } from "react";

import { useBetaFlowInput } from "@/features/beta-tracking";
import {
  ShinhanContactFields,
  shinhanContactSchema,
  shinhanHostEstimateSchema,
  type ShinhanHostEstimateValues,
  ShinhanLiveSubmit,
  useShinhanIntake,
  useShinhanStorage,
} from "@/features/shinhan-intake";
import type { SelectedAddress } from "@/shared/lib/kakao-postcode";
import { AddressSearchDialog } from "@/shared/ui/address-search-dialog";
import { BtnCta } from "@/shared/ui/btn-cta";
import { SelectTile } from "@/shared/ui/select-tile";
import { TextField } from "@/shared/ui/text-field";

import styles from "./shinhan-host-estimate.module.css";

interface EstimateFlowProps {
  introduction: ReactNode;
  incomePreview: ReactNode;
}

const furnitureItems = [
  { key: "bed", label: "침대·매트리스" },
  { key: "desk", label: "책상" },
  { key: "chair", label: "의자" },
  { key: "wardrobe", label: "옷장·수납장" },
] as const;

const furnitureStates = [
  { value: "OWNED", label: "보유 중" },
  { value: "PLANNED", label: "구매 예정" },
  { value: "NONE", label: "없음" },
] as const;

export function ShinhanHostEstimateFlow({ introduction, incomePreview }: EstimateFlowProps) {
  const { draft, updateDraft } = useShinhanIntake();
  const { trackValidInput, markResultReady } = useBetaFlowInput("HOST_ESTIMATE", {
    enabled: draft?.applicationType === "HOST_ESTIMATE",
  });
  const storage = useShinhanStorage();
  const locked = storage.pending || storage.attempt !== null || storage.preparing;
  const [addressOpen, setAddressOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [verifiedContact, setVerifiedContact] = useState<string | null>(null);
  const [contactErrorValues, setContactErrorValues] = useState<{
    phone: string;
    requiredConsent: boolean;
  } | null>(null);
  const closeAddressSearch = useCallback(() => setAddressOpen(false), []);
  const selectAddress = useCallback(
    (address: SelectedAddress) => {
      const selectedAddress = {
        addressSource: "KAKAO_POSTCODE" as const,
        addressRaw: address.address,
        sido: address.sido,
        sigungu: address.sigungu,
      };
      updateDraft((current) =>
        current.applicationType === "HOST_ESTIMATE"
          ? {
              ...current,
              values: {
                ...current.values,
                address: selectedAddress,
              },
            }
          : current,
      );
      setErrors((current) => ({ ...current, address: "" }));
      if (shinhanHostEstimateSchema.shape.address.safeParse(selectedAddress).success) {
        trackValidInput();
      }
    },
    [trackValidInput, updateDraft],
  );

  if (draft?.applicationType !== "HOST_ESTIMATE") return null;
  const values = draft.values;
  const contactSnapshot = JSON.stringify([draft.phone, draft.requiredConsent]);

  function updateValues(
    field: string,
    update: (current: ShinhanHostEstimateValues) => ShinhanHostEstimateValues,
  ) {
    updateDraft((current) =>
      current.applicationType === "HOST_ESTIMATE"
        ? { ...current, values: update(current.values) }
        : current,
    );
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  function showConditions() {
    if (locked) return;
    setErrors({});
    setVerifiedContact(null);
    setContactErrorValues(null);
    updateDraft((current) => ({ ...current, step: "conditions" }));
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function handleConditionsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked) return;
    const parsed = shinhanHostEstimateSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(
        Object.fromEntries(
          parsed.error.issues.map((issue) =>
            issue.path[0] === "address"
              ? ["address", "카카오 주소검색에서 유효한 기본 주소를 선택해 주세요."]
              : [issue.path.join("."), issue.message],
          ),
        ),
      );
      return;
    }
    setErrors({});
    updateDraft((current) => ({ ...current, step: "contact" }));
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function handleContactCheck(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked) return;
    if (!draft) return;
    setContactErrorValues({ phone: draft.phone, requiredConsent: draft.requiredConsent });
    const parsed = shinhanContactSchema.safeParse(draft);
    if (!parsed.success) {
      setErrors(
        Object.fromEntries(
          parsed.error.issues.map((issue) => [issue.path.join("."), issue.message]),
        ),
      );
      setVerifiedContact(null);
      return;
    }
    setErrors({});
    setVerifiedContact(contactSnapshot);
  }

  if (draft.step === "contact") {
    return (
      <div className={styles.contactStep}>
        <div className={styles.contactHeading}>
          <h1>우리 집 빈방의 예상 수익을 확인해 보세요</h1>
          <p>휴대폰 번호와 필수 동의를 확인해 주세요.</p>
        </div>
        {incomePreview}
        <form className={styles.contactForm} onSubmit={handleContactCheck} noValidate>
          <h2>휴대폰 번호를 입력해 주세요</h2>
          <ShinhanContactFields
            onValidInput={trackValidInput}
            errors={{
              phone: contactErrorValues?.phone === draft.phone ? errors.phone : undefined,
              requiredConsent:
                contactErrorValues?.requiredConsent === draft.requiredConsent
                  ? errors.requiredConsent
                  : undefined,
            }}
          />
          {process.env.NODE_ENV === "development" && (
            <>
              <BtnCta type="submit" variant="stroke" className={styles.cta} disabled={locked}>
                입력 형식 확인
              </BtnCta>
              {verifiedContact === contactSnapshot && (
                <p role="status" className={styles.notice}>
                  입력 형식을 확인했어요. 아직 접수되지는 않았습니다.
                </p>
              )}
            </>
          )}
          <ShinhanLiveSubmit onSaved={markResultReady} className={styles.cta}>
            예상 수익 확인하기
          </ShinhanLiveSubmit>
        </form>
        <button type="button" onClick={showConditions} className={styles.back} disabled={locked}>
          ← 입력 정보 수정
        </button>
      </div>
    );
  }

  return (
    <>
      <div className={styles.columns}>
        {introduction}
        <form className={styles.form} onSubmit={handleConditionsSubmit} noValidate>
          <fieldset disabled={locked} className="contents">
            <div className={styles.fieldGroup}>
              <h2 id="estimate-address-label">1. 집은 어디에 있나요?</h2>
              <button
                type="button"
                className={styles.addressButton}
                onClick={() => setAddressOpen(true)}
                aria-labelledby="estimate-address-label estimate-address-value"
                aria-describedby={errors.address ? "estimate-address-error" : undefined}
              >
                <span id="estimate-address-value">
                  {values.address?.addressRaw || "카카오 주소검색으로 주소 선택"}
                </span>
                <span className={styles.addressAction}>{values.address ? "변경" : "검색"}</span>
              </button>
              {errors.address && (
                <p id="estimate-address-error" className={styles.error} role="alert">
                  {errors.address}
                </p>
              )}
              <p className={styles.hint}>주소검색 결과에서 기본 주소를 선택해 주세요.</p>
            </div>
            <fieldset className={styles.fieldGroup}>
              <legend>
                2. 몇 동, 몇 호인가요? <span className={styles.optional}>(선택)</span>
              </legend>
              <div className={styles.addressDetail}>
                <TextField
                  label="동"
                  placeholder="예: 101"
                  value={values.buildingDong}
                  maxLength={40}
                  error={errors.buildingDong}
                  onChange={(event) => {
                    const value = event.target.value;
                    updateValues("buildingDong", (current) => ({
                      ...current,
                      buildingDong: value,
                    }));
                    if (
                      value.trim() &&
                      shinhanHostEstimateSchema.shape.buildingDong.safeParse(value).success
                    ) {
                      trackValidInput();
                    }
                  }}
                  className={styles.textField}
                />
                <TextField
                  label="호수"
                  placeholder="예: 1002"
                  value={values.unitHo}
                  maxLength={40}
                  error={errors.unitHo}
                  onChange={(event) => {
                    const value = event.target.value;
                    updateValues("unitHo", (current) => ({ ...current, unitHo: value }));
                    if (
                      value.trim() &&
                      shinhanHostEstimateSchema.shape.unitHo.safeParse(value).success
                    ) {
                      trackValidInput();
                    }
                  }}
                  className={styles.textField}
                />
              </div>
              <p className={styles.hint}>동이 없는 건물은 호수만 입력해주세요.</p>
            </fieldset>
            <fieldset className={styles.fieldGroup}>
              <legend>3. 빈방에 어떤 가구를 제공하나요?</legend>
              <p className={styles.hint}>입주 전에 구매할 가구도 포함해주세요.</p>
              {furnitureItems.map((item) => (
                <div key={item.key}>
                  <div
                    className={styles.furnitureRow}
                    role="group"
                    aria-labelledby={`estimate-${item.key}`}
                    aria-describedby={
                      errors[`furniture.${item.key}`] ? `estimate-${item.key}-error` : undefined
                    }
                  >
                    <span id={`estimate-${item.key}`} className={styles.furnitureLabel}>
                      {item.label}
                    </span>
                    <div className={styles.segmented}>
                      {furnitureStates.map((state) => (
                        <SelectTile
                          key={state.value}
                          selected={values.furniture[item.key] === state.value}
                          className={styles.segment}
                          onClick={() => {
                            updateValues(`furniture.${item.key}`, (current) => ({
                              ...current,
                              furniture: { ...current.furniture, [item.key]: state.value },
                            }));
                            if (
                              shinhanHostEstimateSchema.shape.furniture.shape[item.key].safeParse(
                                state.value,
                              ).success
                            ) {
                              trackValidInput();
                            }
                          }}
                        >
                          {state.label}
                        </SelectTile>
                      ))}
                    </div>
                  </div>
                  {errors[`furniture.${item.key}`] && (
                    <p id={`estimate-${item.key}-error`} className={styles.error} role="alert">
                      {errors[`furniture.${item.key}`]}
                    </p>
                  )}
                </div>
              ))}
            </fieldset>
            <fieldset
              className={styles.fieldGroup}
              aria-describedby={errors.bathroomCount ? "estimate-bathroom-error" : undefined}
            >
              <legend>4. 집에 화장실이 몇 개인가요?</legend>
              <div className={styles.segmented}>
                {([1, 2] as const).map((count) => (
                  <SelectTile
                    key={count}
                    selected={values.bathroomCount === count}
                    className={styles.segment}
                    onClick={() => {
                      updateValues("bathroomCount", (current) => ({
                        ...current,
                        bathroomCount: count,
                      }));
                      if (shinhanHostEstimateSchema.shape.bathroomCount.safeParse(count).success) {
                        trackValidInput();
                      }
                    }}
                  >
                    화장실 {count}개
                  </SelectTile>
                ))}
              </div>
              {errors.bathroomCount && (
                <p id="estimate-bathroom-error" className={styles.error} role="alert">
                  {errors.bathroomCount}
                </p>
              )}
            </fieldset>
            <div className={styles.actions}>
              <BtnCta type="submit" className={styles.cta}>
                빈방 예상 월세 확인하기 →
              </BtnCta>
              <p className={styles.hint}>실제 월세는 평면도와 방 상태 확인 후 달라질 수 있어요.</p>
            </div>
          </fieldset>
        </form>
      </div>
      <AddressSearchDialog
        open={addressOpen}
        onClose={closeAddressSearch}
        onSelect={selectAddress}
      />
    </>
  );
}

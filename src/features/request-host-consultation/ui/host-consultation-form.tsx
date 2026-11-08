"use client";

import { useMutation } from "@tanstack/react-query";
import { useId, useState } from "react";

import { useConsultationRegions } from "@/domains/consultation-region";
import { ApiError } from "@/shared/api";
import { formatKoreanPhoneInput } from "@/shared/lib/korean-phone";
import { BtnCta } from "@/shared/ui/btn-cta";
import { Checkbox } from "@/shared/ui/checkbox";
import { TextField } from "@/shared/ui/text-field";

import { requestConsultation } from "../api/request-consultation.api";
import { consultationPrivacyPolicy } from "../config/privacy-policy";
import { hostConsultationFormSchema } from "../model/host-consultation.schema";

import styles from "./host-consultation.module.css";

interface ChoiceGroupProps {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  error?: string;
}
function ChoiceGroup({ label, name, options, error }: ChoiceGroupProps) {
  return (
    <fieldset aria-describedby={error ? `${name}-error` : undefined}>
      <legend className={styles.legend}>{label}</legend>
      <div className={styles.choices}>
        {options.map((option) => (
          <label key={option.value} className={styles.choice}>
            <input className="sr-only" type="radio" name={name} value={option.value} />
            {option.label}
          </label>
        ))}
      </div>
      {error && (
        <p id={`${name}-error`} className="mt-2 text-sm text-system-error">
          {error}
        </p>
      )}
    </fieldset>
  );
}

export function HostConsultationForm() {
  const formId = useId();
  const [regionType, setRegionType] = useState<"university" | "subway">("university");
  const [regionId, setRegionId] = useState("");
  const [customRegionName, setCustomRegionName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const regions = useConsultationRegions(regionType);
  const mutation = useMutation({ mutationFn: requestConsultation, retry: false });
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string>();
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [consent, setConsent] = useState(false);

  function validatePhone() {
    const result = hostConsultationFormSchema.shape.phone.safeParse(phone);
    setPhoneError(result.success ? undefined : result.error.issues[0]?.message);
  }

  if (mutation.isSuccess)
    return (
      <div role="status" className="space-y-4 py-8 text-center">
        <h3 className="text-xl font-bold">상담 신청이 접수되었습니다.</h3>
        <p>담당 매니저가 남겨주신 연락처로 연락드립니다.</p>
      </div>
    );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mutation.isPending) return;
    const fields = new FormData(event.currentTarget);
    const parsed = hostConsultationFormSchema.safeParse({
      regionType,
      regionId,
      customRegionName,
      phone,
      roomCount: fields.get("roomCount"),
      airConditioner: fields.get("airConditioner"),
      tenure: fields.get("tenure"),
      consent,
    });
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) nextErrors[String(issue.path[0])] ??= issue.message;
      setErrors(nextErrors);
      setPhoneError(nextErrors.phone);
      return;
    }
    setErrors({});
    setPhoneError(undefined);
    mutation.mutate(parsed.data);
  }
  const submissionError =
    mutation.error instanceof ApiError && mutation.error.status === 409
      ? "같은 연락처와 지역으로 접수된 상담 신청이 있습니다. 담당자의 연락을 기다려주세요."
      : mutation.isError
        ? "접수 결과를 확인하지 못했습니다. 입력 내용은 유지됩니다. 잠시 후 다시 시도해주세요."
        : undefined;
  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate aria-busy={mutation.isPending}>
      <fieldset disabled={mutation.isPending} className={styles.form}>
        <p className={styles.description}>방 정보를 남겨주시면 확인 후 연락드립니다.</p>
        <fieldset>
          <legend className={styles.legend}>지역</legend>
          <div className={`${styles.choices} ${styles.regionChoices}`}>
            {[
              { value: "university", label: "대학교" },
              { value: "subway", label: "지하철역" },
            ].map((option) => (
              <label key={option.value} className={styles.choice}>
                <input
                  type="radio"
                  name="regionType"
                  value={option.value}
                  checked={regionType === option.value}
                  onChange={() => {
                    setRegionType(option.value === "university" ? "university" : "subway");
                    setRegionId("");
                    setCustomRegionName("");
                    setErrors({});
                    mutation.reset();
                  }}
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}
          </div>
          <label htmlFor={`${formId}-region`} className="sr-only">
            {regionType === "university" ? "대학교" : "지하철역"} 선택
          </label>
          <select
            id={`${formId}-region`}
            name="regionId"
            value={regionId}
            onChange={(event) => {
              setRegionId(event.target.value);
              setCustomRegionName("");
            }}
            className={styles.regionInput}
            aria-invalid={!!errors.regionId}
            aria-describedby={`${formId}-region-status`}
          >
            <option value="">
              {regionType === "university" ? "대학교를" : "지하철역을"} 선택해 주세요
            </option>
            {regions.data?.map((region) => (
              <option key={region.id} value={region.id}>
                {region.type === "university"
                  ? region.displayName
                  : `${region.name}${regions.data.filter((item) => item.name === region.name).length > 1 ? ` (${region.sido} ${region.sigungu})` : ""}`}
              </option>
            ))}
            <option value="other" disabled={regionType === "subway"}>
              {regionType === "subway" ? "기타 직접 입력 (준비 중)" : "기타 직접 입력"}
            </option>
          </select>
          <div id={`${formId}-region-status`} className="mt-2 text-sm" aria-live="polite">
            {regions.isPending && <p>지역 목록을 불러오고 있습니다.</p>}
            {regions.isError && (
              <p>
                지역 목록을 불러오지 못했습니다.{" "}
                <button type="button" className="underline" onClick={() => void regions.refetch()}>
                  다시 불러오기
                </button>
              </p>
            )}
            {regions.isSuccess && regions.data.length === 0 && <p>등록된 지역이 없습니다.</p>}
            {errors.regionId && <p className="text-system-error">{errors.regionId}</p>}
            {regionType === "subway" && <p>현재 목록에 있는 역만 신청할 수 있습니다.</p>}
          </div>
          {regionId === "other" && (
            <TextField
              label="대학교명 직접 입력"
              name="customRegionName"
              value={customRegionName}
              maxLength={160}
              placeholder="대학교·캠퍼스명을 입력해주세요"
              onChange={(event) => setCustomRegionName(event.target.value)}
              error={errors.customRegionName}
              className="mt-3"
            />
          )}
        </fieldset>
        <ChoiceGroup
          label="방 개수"
          error={errors.roomCount}
          name="roomCount"
          options={[
            { value: "1", label: "1개" },
            { value: "2", label: "2개" },
            { value: "3_PLUS", label: "3개 이상" },
          ]}
        />
        <ChoiceGroup
          label="에어컨"
          error={errors.airConditioner}
          name="airConditioner"
          options={[
            { value: "yes", label: "있음" },
            { value: "no", label: "없음" },
          ]}
        />
        <ChoiceGroup
          label="주택 형태"
          error={errors.tenure}
          name="tenure"
          options={[
            { value: "owned", label: "자가" },
            { value: "rented", label: "전세·월세" },
          ]}
        />
        <TextField
          className={styles.phone}
          label="연락처"
          name="phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          placeholder="010-0000-0000"
          value={phone}
          onChange={(event) => {
            setPhone(formatKoreanPhoneInput(event.target.value));
            setPhoneError(undefined);
          }}
          onBlur={validatePhone}
          error={phoneError}
        />
        <div>
          <div className={styles.consent}>
            <Checkbox
              id={`${formId}-consent`}
              name="consent"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
              size="32"
              className={styles.checkbox}
            />
            <label htmlFor={`${formId}-consent`}>개인정보 수집·이용 동의 (필수)</label>
          </div>
          {errors.consent && <p className="text-sm text-system-error">{errors.consent}</p>}
          <button
            type="button"
            aria-expanded={showPrivacy}
            aria-controls={`${formId}-privacy`}
            onClick={() => setShowPrivacy(!showPrivacy)}
            className={styles.privacyLink}
          >
            수집 항목·목적·보유 기간 보기
          </button>
          {showPrivacy && (
            <div
              id={`${formId}-privacy`}
              className="mt-2 space-y-3 rounded-xl bg-grayscale-50 p-4 text-sm leading-relaxed text-grayscale-700"
            >
              <h3 className="font-semibold">개인정보 수집·이용 동의</h3>
              <p>수집 항목: 지역, 방 개수, 에어컨 유무, 주택 형태, 연락처</p>
              <p>수집 목적: 1:1 매니저 상담 안내와 지역별 수요 파악</p>
              <p>보유 기간: {consultationPrivacyPolicy.retention}</p>
              <p>동의를 거부할 수 있으나, 동의하지 않으면 상담 신청이 어렵습니다.</p>
            </div>
          )}
        </div>
        {submissionError && (
          <p role="alert" className="text-sm text-system-error">
            {submissionError}
          </p>
        )}
        <BtnCta type="submit" size="xl" loading={mutation.isPending} className={styles.submit}>
          1:1 상담 신청하기
        </BtnCta>
      </fieldset>
    </form>
  );
}

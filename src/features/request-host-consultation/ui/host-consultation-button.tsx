"use client";

import { useId, useState } from "react";

import { formatKoreanPhoneInput } from "@/shared/lib/korean-phone";
import { BtnCta } from "@/shared/ui/btn-cta";
import { Checkbox } from "@/shared/ui/checkbox";
import { Modal } from "@/shared/ui/modal";
import { TextField } from "@/shared/ui/text-field";

import { hostConsultationFormSchema } from "../model/host-consultation.schema";

import styles from "./host-consultation.module.css";

interface ChoiceGroupProps {
  label: string;
  name: string;
  options: { value: string; label: string }[];
}
function ChoiceGroup({ label, name, options }: ChoiceGroupProps) {
  return (
    <fieldset>
      <legend className={styles.legend}>{label}</legend>
      <div className={styles.choices}>
        {options.map((option) => (
          <label key={option.value} className={styles.choice}>
            <input className="sr-only" type="radio" name={name} value={option.value} />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function HostConsultationButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <BtnCta
        size="xl"
        onClick={() => setOpen(true)}
        className="h-[58px] w-full max-w-[490px] gap-[14px] rounded-2xl px-4 py-0 text-base leading-[26px] font-bold tracking-[-0.01em] md:px-9 md:text-xl"
      >
        우리 집은 얼마 받을 수 있는지 상담하기 <span aria-hidden="true">›</span>
      </BtnCta>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={"전담 매니저가 우리 집에 맞는\n조건을 알려드립니다"}
        classNames={{
          overlay: "bg-grayscale-900/60 px-4 py-4 md:py-20",
          dialog: styles.dialog,
          title: styles.title,
          header: styles.header,
          closeButton: styles.closeButton,
          panel: styles.panel,
        }}
      >
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap"
        />
        <HostConsultationForm />
      </Modal>
    </>
  );
}

function HostConsultationForm() {
  const formId = useId();
  const [regionType, setRegionType] = useState("university");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string>();
  const [showPrivacy, setShowPrivacy] = useState(false);

  function validatePhone() {
    const result = hostConsultationFormSchema.shape.phone.safeParse(phone);
    setPhoneError(result.success ? undefined : result.error.issues[0]?.message);
  }

  // 지역 목록, 접수 API, 동의 보유기간이 확정되기 전에는 개인정보를 전송하지 않습니다.
  return (
    <form className={styles.form} onSubmit={(event) => event.preventDefault()}>
      <p className={styles.description}>방 정보를 남겨주시면 확인 후 연락드립니다.</p>
      <fieldset>
        <legend className={styles.legend}>지역</legend>
        <div className={`${styles.choices} ${styles.regionChoices}`}>
          {[
            { value: "university", label: "대학교" },
            { value: "station", label: "지하철역" },
          ].map((option) => (
            <label key={option.value} className={styles.choice}>
              <input
                type="radio"
                name="regionType"
                value={option.value}
                checked={regionType === option.value}
                onChange={() => setRegionType(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          ))}
        </div>
        <label htmlFor={`${formId}-region`} className="sr-only">
          {regionType === "university" ? "대학교" : "지하철역"} 선택
        </label>
        <select id={`${formId}-region`} name="regionId" disabled className={styles.regionInput}>
          <option value="">
            {regionType === "university" ? "대학교를" : "지하철역을"} 선택해 주세요
          </option>
        </select>
      </fieldset>
      <ChoiceGroup
        label="방 개수"
        name="roomCount"
        options={[
          { value: "1", label: "1개" },
          { value: "2", label: "2개" },
          { value: "3_PLUS", label: "3개 이상" },
        ]}
      />
      <ChoiceGroup
        label="에어컨"
        name="airConditioner"
        options={[
          { value: "yes", label: "있음" },
          { value: "no", label: "없음" },
        ]}
      />
      <ChoiceGroup
        label="주택 형태"
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
            size="32"
            disabled
            className={styles.checkbox}
          />
          <label htmlFor={`${formId}-consent`}>개인정보 수집·이용 동의 (필수)</label>
        </div>
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
            <p>보유 기간: 확정 후 안내 예정입니다.</p>
          </div>
        )}
      </div>
      <BtnCta type="submit" size="xl" disabled className={styles.submit}>
        1:1 상담 신청하기
      </BtnCta>
    </form>
  );
}

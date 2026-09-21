"use client";

import { useId, useState } from "react";

import { formatKoreanPhoneInput } from "@/shared/lib/korean-phone";
import { BtnCta } from "@/shared/ui/btn-cta";
import { Checkbox } from "@/shared/ui/checkbox";
import { Modal } from "@/shared/ui/modal";
import { TextField } from "@/shared/ui/text-field";

import { hostConsultationFormSchema } from "../model/host-consultation.schema";

interface ChoiceGroupProps {
  label: string;
  name: string;
  options: { value: string; label: string }[];
}
function ChoiceGroup({ label, name, options }: ChoiceGroupProps) {
  return (
    <fieldset>
      <legend className="mb-3 text-base font-semibold text-grayscale-800">{label}</legend>
      <div className="flex gap-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="relative flex min-h-14 flex-1 cursor-pointer items-center justify-center rounded-xl border border-grayscale-200 px-2 py-3 text-center text-base text-grayscale-500 has-checked:border-primary-400 has-checked:bg-primary-50 has-checked:text-primary-500 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary-500"
          >
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
        className="min-h-[58px] w-full max-w-[490px] rounded-2xl text-base md:text-xl"
      >
        우리 집은 얼마 받을 수 있는지 상담하기 <span aria-hidden="true">›</span>
      </BtnCta>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="전담 매니저가 우리 집에 맞는 조건을 알려드립니다"
        classNames={{
          dialog: "max-w-[572px]",
          title: "max-w-[420px] text-xl font-bold leading-relaxed md:text-2xl",
          panel: "max-h-[calc(100dvh-80px)] overflow-y-auto",
        }}
      >
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
    <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
      <p className="text-base text-grayscale-600">방 정보를 남겨주시면 확인 후 연락드립니다.</p>
      <aside className="rounded-xl bg-primary-50 p-4 text-sm leading-relaxed text-grayscale-700">
        온라인 상담 신청을 준비하고 있습니다. 지금 상담이 필요하시면{" "}
        <a className="font-semibold text-primary-500 underline" href="tel:01045879428">
          전화 상담
        </a>{" "}
        또는{" "}
        <a
          className="font-semibold text-primary-500 underline"
          href="https://pf.kakao.com/_BKlhX/chat"
          target="_blank"
          rel="noopener noreferrer"
        >
          카카오 문의
        </a>
        를 이용해 주세요.
      </aside>
      <fieldset>
        <legend className="mb-3 text-base font-semibold text-grayscale-800">지역</legend>
        <div className="mb-3 flex gap-2">
          {[
            { value: "university", label: "대학교" },
            { value: "station", label: "지하철역" },
          ].map((option) => (
            <label
              key={option.value}
              className="relative flex min-h-14 flex-1 cursor-pointer items-center justify-center rounded-xl border border-grayscale-200 text-base text-grayscale-500 has-checked:border-primary-400 has-checked:bg-primary-50 has-checked:text-primary-500 has-focus-visible:outline-2 has-focus-visible:outline-offset-2"
            >
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
        <select
          id={`${formId}-region`}
          name="regionId"
          disabled
          className="h-14 w-full rounded-xl border border-grayscale-200 bg-grayscale-50 px-4 text-grayscale-500"
        >
          <option value="">
            {regionType === "university" ? "대학교" : "지하철역"} 선택 준비 중
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
        <label className="flex items-center gap-2 text-sm text-grayscale-800">
          <Checkbox name="consent" disabled />
          개인정보 수집·이용 동의 (필수)
        </label>
        <button
          type="button"
          aria-expanded={showPrivacy}
          aria-controls={`${formId}-privacy`}
          onClick={() => setShowPrivacy(!showPrivacy)}
          className="mt-2 min-h-11 text-sm text-grayscale-600 underline underline-offset-4"
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
            <p>보유 기간: 확정 후 안내 예정입니다. 현재는 온라인 신청을 접수하지 않습니다.</p>
          </div>
        )}
      </div>
      <BtnCta type="submit" size="xl" disabled className="w-full">
        1:1 상담 신청하기
      </BtnCta>
    </form>
  );
}

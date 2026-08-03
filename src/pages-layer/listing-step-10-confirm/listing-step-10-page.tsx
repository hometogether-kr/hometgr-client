"use client";

import { useState } from "react";

import {
  PREFERRED_CONTACT_METHOD_OPTIONS,
  PREFERRED_CONTACT_TIME_OPTIONS,
  type PreferredContactMethod,
  type PreferredContactTime,
} from "@/domains/listing-draft";
import { Checkbox } from "@/shared/ui/checkbox";
import { ChipField } from "@/shared/ui/chip-field";
import { InfoBox } from "@/shared/ui/info-box";
import { TextField } from "@/shared/ui/text-field";
import { Toast, ToastViewport } from "@/shared/ui/toast";
import { ListingStepLayout } from "@/widgets/listing-step-layout";

const REQUIRED_MESSAGE = "필수 항목입니다.";
const PHONE_MESSAGE = "휴대전화 번호 형식을 확인해주세요.";
const AGREEMENT_MESSAGE = "필수 약관 동의 이후 이용 가능합니다.";

export interface ListingStep10Values {
  contactName: string;
  contactPhone: string;
  preferredContactTime: PreferredContactTime;
  preferredContactMethod: PreferredContactMethod;
  /** 매물 공개 동의 — 서버는 true만 받습니다. */
  roomPublication: true;
  /** 사기 방지 서약 — 서버는 true만 받습니다. */
  noFraudPledge: true;
}

/** 최종 확인 단계의 필수 동의 2종 (OpenAPI: Step11ContactDto) */
const REQUIRED_AGREEMENTS = [
  {
    key: "roomPublication",
    label: "매물 등록 검수 및 연락을 위해 개인정보 수집·이용에 동의합니다.",
  },
  {
    key: "noFraudPledge",
    label: "허위 매물을 등록하지 않으며, 직접 거래를 유도하지 않을 것을 서약합니다.",
  },
] as const satisfies readonly { key: "roomPublication" | "noFraudPledge"; label: string }[];

type AgreementKey = (typeof REQUIRED_AGREEMENTS)[number]["key"];

export interface ListingStep10InitialValues {
  contactName: string;
  contactPhone: string;
  preferredContactTime: PreferredContactTime | null;
  preferredContactMethod: PreferredContactMethod | null;
}

const EMPTY_VALUES: ListingStep10InitialValues = {
  contactName: "",
  contactPhone: "",
  preferredContactTime: null,
  preferredContactMethod: null,
};

export interface ListingStep10PageProps {
  initialValues?: ListingStep10InitialValues;
  onPrev?: () => void;
  /** 연락처 저장 후 매물 등록 요청 제출 */
  onSubmit?: (values: ListingStep10Values) => void;
  isSubmitting?: boolean;
  /** 화면에서 입력한 연락처가 서버 형식으로 바뀌는지 확인합니다. */
  validatePhone?: (phone: string) => boolean;
}

/**
 * 10단계 · 최종 확인 (Figma: node 420:7246 · 472:17534 · 472:18277)
 */
export function ListingStep10Page({
  initialValues = EMPTY_VALUES,
  onPrev,
  onSubmit,
  isSubmitting = false,
  validatePhone = () => true,
}: ListingStep10PageProps) {
  const [name, setName] = useState(initialValues.contactName);
  const [phone, setPhone] = useState(initialValues.contactPhone);
  const [contactTime, setContactTime] = useState<PreferredContactTime | null>(
    initialValues.preferredContactTime,
  );
  const [contactMethod, setContactMethod] = useState<PreferredContactMethod | null>(
    initialValues.preferredContactMethod,
  );
  const [agreements, setAgreements] = useState<Record<AgreementKey, boolean>>({
    roomPublication: false,
    noFraudPledge: false,
  });
  const [submitted, setSubmitted] = useState(false);

  const allAgreed = REQUIRED_AGREEMENTS.every(({ key }) => agreements[key]);

  const errors = {
    name: name.trim() === "" ? REQUIRED_MESSAGE : undefined,
    phone:
      phone.trim() === "" ? REQUIRED_MESSAGE : validatePhone(phone) ? undefined : PHONE_MESSAGE,
    contactTime: !contactTime ? REQUIRED_MESSAGE : undefined,
    contactMethod: !contactMethod ? REQUIRED_MESSAGE : undefined,
    agreed: !allAgreed ? AGREEMENT_MESSAGE : undefined,
  };
  const hasError = Object.values(errors).some(Boolean);
  const show = (key: keyof typeof errors) => (submitted ? errors[key] : undefined);

  const handleSubmit = () => {
    setSubmitted(true);
    if (hasError || !contactTime || !contactMethod) return;

    onSubmit?.({
      contactName: name.trim(),
      contactPhone: phone.trim(),
      preferredContactTime: contactTime,
      preferredContactMethod: contactMethod,
      roomPublication: true,
      noFraudPledge: true,
    });
  };

  return (
    <>
      {submitted && hasError && (
        <ToastViewport>
          <Toast variant="error">필수항목을 모두 입력해주세요.</Toast>
        </ToastViewport>
      )}
      <ListingStepLayout
        step={10}
        eyebrow="최종확인"
        title="매물 등록 요청을 완료해주세요"
        nextLabel="등록 요청하기"
        onPrev={onPrev}
        onNext={handleSubmit}
        nextDisabled={isSubmitting}
        autoSaving={isSubmitting}
      >
        <div className="flex w-full flex-col gap-9">
          <div className="flex w-full flex-col gap-7">
            <h2 className="w-full text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-grayscale-900">
              연락받으실 정보를 남겨주세요
            </h2>
            <div className="flex w-full flex-col items-start gap-4 md:flex-row">
              <TextField
                label="이름"
                placeholder="홍길동"
                size="L"
                className="flex-1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={show("name")}
              />
              <TextField
                label="연락처"
                placeholder="010-1234-5678"
                size="L"
                className="flex-1"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={show("phone")}
              />
            </div>
            <ChipField
              label="선호하는 연락 시간"
              options={PREFERRED_CONTACT_TIME_OPTIONS}
              value={contactTime}
              onChange={setContactTime}
              error={show("contactTime")}
            />
            <ChipField
              label="선호하는 상담 수단"
              options={PREFERRED_CONTACT_METHOD_OPTIONS}
              value={contactMethod}
              onChange={setContactMethod}
              error={show("contactMethod")}
            />
          </div>
          <hr className="w-full border-grayscale-200" />
          <div className="flex w-full flex-col gap-3">
            <h2 className="w-full text-2xl leading-[1.4] font-semibold tracking-[-0.24px] text-grayscale-900">
              약관 동의
            </h2>
            {REQUIRED_AGREEMENTS.map(({ key, label }) => (
              <label key={key} className="flex cursor-pointer items-center gap-2">
                <Checkbox
                  size="24"
                  checked={agreements[key]}
                  onChange={(e) => setAgreements((prev) => ({ ...prev, [key]: e.target.checked }))}
                />
                <span className="text-base leading-[1.5] font-medium text-grayscale-700">
                  {label}
                </span>
              </label>
            ))}
            {show("agreed") && (
              <p className="w-full text-[13px] leading-[1.4] font-medium text-system-error">
                {show("agreed")}
              </p>
            )}
          </div>
          <InfoBox title="등록 전, 담당자가 한 번 더 확인해드립니다" className="w-full">
            입력하신 정보는 즉시 공개되지 않으며, 담당 매니저의 꼼꼼한 검토를 거친 후 안전하게
            등록됩니다.
          </InfoBox>
        </div>
      </ListingStepLayout>
    </>
  );
}

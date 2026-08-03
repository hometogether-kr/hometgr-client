"use client";

import type { ReceiptRequest } from "@/domains/settlement";
import { BANK_OPTIONS } from "@/domains/settlement";
import { BtnCta } from "@/shared/ui/btn-cta";
import { Divider } from "@/shared/ui/divider";
import { Dropdown } from "@/shared/ui/dropdown";
import { InfoBox } from "@/shared/ui/info-box";
import { Radio } from "@/shared/ui/radio";
import { TextField } from "@/shared/ui/text-field";

import type { SettlementAccountForm as FormState } from "../model/use-settlement-account-form";

export interface SettlementAccountFormProps {
  form: FormState;
}

const RECEIPT_OPTIONS: readonly { value: ReceiptRequest; label: string }[] = [
  { value: "requested", label: "신청" },
  { value: "notRequested", label: "신청 안 함" },
];

/** 섹션 제목 — Figma는 20px Medium입니다 (계정 정보의 Bold와 다릅니다). */
function SectionTitle({ children }: { children: string }) {
  return <h2 className="text-heading-2 font-medium text-grayscale-900">{children}</h2>;
}

/**
 * 정산 계좌 입력 폼 (Figma: 703:16495)
 *
 * 계좌 정보와 영수증 발급 여부를 구분선으로 나눈 두 블록으로 구성됩니다.
 */
export function SettlementAccountForm({ form }: SettlementAccountFormProps) {
  const { values, errors } = form;

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-6">
        <SectionTitle>정산대금 입금계좌</SectionTitle>

        <div className="flex flex-col gap-2">
          <span className="text-label-1 font-medium text-grayscale-600">은행명</span>
          <Dropdown
            options={BANK_OPTIONS}
            value={values.bank ?? undefined}
            onChange={form.setBank}
            placeholder="은행을 선택해주세요"
          />
          {errors.bank && (
            <p className="px-1 text-label-2 font-medium text-system-error">{errors.bank}</p>
          )}
        </div>

        <TextField
          label="계좌 번호"
          inputMode="numeric"
          placeholder="- 없이 숫자만 입력해주세요"
          value={values.accountNumber}
          error={errors.accountNumber}
          onChange={(event) => form.setAccountNumber(event.target.value)}
        />

        <TextField
          label="예금주명"
          placeholder="예금주명을 입력해주세요"
          value={values.holderName}
          error={errors.holderName}
          onChange={(event) => form.setHolderName(event.target.value)}
          action={
            /* Figma 703:16517 — 확인 버튼만 grayscale-800(emphasize)입니다. */
            <BtnCta
              variant="emphasize"
              size="xs"
              className="h-[34px] w-[66px]"
              onClick={form.verifyHolder}
            >
              {values.holderVerified ? "확인됨" : "확인"}
            </BtnCta>
          }
        />
      </section>

      <Divider />

      <section className="flex flex-col gap-4">
        <SectionTitle>수수료에 대한 영수증 발급</SectionTitle>

        <fieldset className="flex gap-12 px-2.5">
          <legend className="sr-only">수수료에 대한 영수증 발급 신청 여부</legend>
          {RECEIPT_OPTIONS.map((option) => (
            <label key={option.value} className="flex cursor-pointer items-center gap-2.5">
              <Radio
                name="receipt"
                value={option.value}
                checked={values.receipt === option.value}
                onChange={() => form.setReceipt(option.value)}
              />
              <span className="text-body-1 font-medium text-grayscale-900">{option.label}</span>
            </label>
          ))}
        </fieldset>

        <InfoBox
          className="flex flex-col gap-1.5 bg-primary-100 px-5 py-4"
          title="홈투게더는 서비스 수수료에 대한 세금계산서/현금영수증을 발행해 드립니다."
        >
          임차인 입주 시점에 입력된 영수증 정보를 기준으로 수수료에 대한 영수증이 발행되며, 정보
          미입력 또는 오기재 시 자진 발급으로 처리됩니다.
        </InfoBox>
      </section>
    </div>
  );
}

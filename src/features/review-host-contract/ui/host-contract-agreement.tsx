"use client";

import Image from "next/image";
import { useState } from "react";

import { BtnCta } from "@/shared/ui/btn-cta";
import { Checkbox } from "@/shared/ui/checkbox";
import { Modal } from "@/shared/ui/modal";

interface HostContractAgreementProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function HostContractAgreement({
  checked,
  onCheckedChange,
  disabled = false,
}: HostContractAgreementProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  function handleContractOpen() {
    setIsZoomed(false);
    setIsOpen(true);
  }

  return (
    <section aria-labelledby="host-contract-heading" className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h2
          id="host-contract-heading"
          className="text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-grayscale-900"
        >
          전대차 계약 동의
        </h2>
        <p className="text-sm leading-[1.5] font-medium text-grayscale-600">
          집주인과 홈투게더 운영사 간의 계약서를 확인해주세요.
        </p>
      </div>

      <button
        type="button"
        onClick={handleContractOpen}
        disabled={disabled}
        aria-haspopup="dialog"
        className="flex w-full flex-col gap-3 rounded-xl border border-grayscale-200 p-5 text-left transition-colors hover:bg-grayscale-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-row sm:items-center sm:justify-between"
      >
        <span className="text-base leading-[1.5] font-medium break-keep text-grayscale-800">
          주택 일부 임대차 및 조건부 전대 동의 계약서
        </span>
        <span className="shrink-0 text-sm leading-[1.5] font-semibold text-primary-500">
          계약서 보기
          <span aria-hidden="true" className="ml-2">
            →
          </span>
        </span>
      </button>

      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-2">
          <Checkbox
            id="host-contract-agreement"
            size="24"
            checked={checked}
            onChange={(event) => onCheckedChange(event.target.checked)}
            disabled={disabled}
            className="mt-2.5 shrink-0 rounded focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary-500"
          />
          <label
            htmlFor="host-contract-agreement"
            className="flex min-h-11 cursor-pointer items-center py-2 text-base leading-[1.5] font-medium text-grayscale-700"
          >
            [선택] 계약서 내용을 확인했으며, 홈투게더 운영사와의 계약 및 조건부 전대에 동의합니다.
          </label>
        </div>
      </div>

      <p className="text-sm leading-[1.5] font-medium text-grayscale-500">
        동의하지 않아도 매물 등록을 요청할 수 있습니다. 계약 체결은 운영사 검토 후 진행됩니다.
      </p>

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="전대차 계약서"
        classNames={{
          overlay: "overflow-hidden py-4 md:py-8",
          dialog: "max-h-full md:w-[960px]",
          panel: "min-h-0 gap-4 md:px-6 md:py-5",
          header: "gap-3",
        }}
        footer={
          <BtnCta type="button" size="m" className="w-full" onClick={() => setIsOpen(false)}>
            닫기
          </BtnCta>
        }
      >
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
          <p id="host-contract-viewer-hint" className="text-sm leading-[1.5] text-grayscale-600">
            확대하면 좌우로 이동하며 원문을 읽을 수 있습니다.
          </p>
          <BtnCta
            type="button"
            size="xs"
            variant="stroke"
            aria-pressed={isZoomed}
            onClick={() => setIsZoomed((current) => !current)}
          >
            {isZoomed ? "화면에 맞추기" : "확대하기"}
          </BtnCta>
        </div>
        <div
          role="region"
          aria-label="전대차 계약서 원문"
          aria-describedby="host-contract-viewer-hint"
          tabIndex={0}
          className="min-h-0 overflow-auto overscroll-contain rounded-lg border border-grayscale-200 bg-grayscale-50 focus-visible:outline-2 focus-visible:outline-primary-500"
        >
          <Image
            src="/contracts/host-sublease-agreement.png"
            alt="주택 일부 임대차 및 조건부 전대 동의 계약서 원문"
            width={1556}
            height={2200}
            unoptimized
            draggable={false}
            className={isZoomed ? "h-auto w-[1556px] max-w-none" : "h-auto w-full"}
          />
        </div>
      </Modal>
    </section>
  );
}

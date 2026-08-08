"use client";

import { useId, useState } from "react";

import type { BankCode } from "@/domains/settlement";
import { BANK_OPTIONS } from "@/domains/settlement";
import { cn } from "@/shared/lib/cn";
import { Icon } from "@/shared/ui/icons";

import { BankSelectModal } from "./bank-select-modal";

export interface BankSelectFieldProps {
  value: BankCode | null;
  onChange: (bank: BankCode) => void;
  error?: string;
  /** 은행 목록을 불러오는 중인지 여부 — 모달의 스켈레톤에 그대로 전달됩니다. */
  loading?: boolean;
}

const PLACEHOLDER = "은행을 선택해주세요";

/**
 * 은행명 선택 (Figma: 703:23594)
 *
 * 트리거는 드롭다운과 같은 모양이지만 목록을 펼치지 않고 은행 선택 모달을 엽니다.
 */
export function BankSelectField({ value, onChange, error, loading = false }: BankSelectFieldProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const labelId = useId();

  const selectedLabel = BANK_OPTIONS.find((option) => option.value === value)?.label;

  const handleConfirm = (bank: BankCode) => {
    onChange(bank);
    setModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <span id={labelId} className="text-label-1 font-medium text-grayscale-600">
        은행명
      </span>

      <button
        type="button"
        aria-labelledby={labelId}
        aria-haspopup="dialog"
        aria-expanded={modalOpen}
        onClick={() => setModalOpen(true)}
        className="flex h-11 w-full items-center justify-between rounded-lg border border-solid border-grayscale-300 bg-white px-3 py-3 transition-colors"
      >
        <span
          className={cn(
            "text-body-1 font-medium whitespace-nowrap",
            selectedLabel ? "text-grayscale-900" : "text-grayscale-500",
          )}
        >
          {selectedLabel ?? PLACEHOLDER}
        </span>
        <span className="flex shrink-0 items-center justify-center p-1 text-grayscale-600">
          <Icon name="keyboard_arrow_down" size={20} />
        </span>
      </button>

      {error && <p className="px-1 text-label-2 font-medium text-system-error">{error}</p>}

      {modalOpen && (
        <BankSelectModal
          options={BANK_OPTIONS}
          selected={value}
          loading={loading}
          onConfirm={handleConfirm}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}

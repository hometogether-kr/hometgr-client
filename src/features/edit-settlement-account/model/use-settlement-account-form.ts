"use client";

import { useState } from "react";

import type { BankCode, ReceiptRequest, SettlementAccount } from "@/domains/settlement";
import { EMPTY_SETTLEMENT_ACCOUNT } from "@/domains/settlement";

export interface SettlementAccountErrors {
  bank?: string;
  accountNumber?: string;
  holderName?: string;
}

export interface SettlementAccountForm {
  values: SettlementAccount;
  errors: SettlementAccountErrors;
  setBank: (bank: BankCode) => void;
  setAccountNumber: (accountNumber: string) => void;
  setHolderName: (holderName: string) => void;
  setReceipt: (receipt: ReceiptRequest) => void;
  /** 예금주 실명 확인 */
  verifyHolder: () => void;
  /**
   * 제출 가능 여부를 검사하고 에러를 채웁니다.
   * 통과하면 검증된 값을, 실패하면 null을 돌려줍니다.
   */
  validate: () => SettlementAccount | null;
}

const DIGITS_ONLY = /^\d+$/;

/** 계좌번호 최소 자릿수 — 국내 은행 계좌는 10자리 이상입니다. */
const MIN_ACCOUNT_LENGTH = 10;

function validateValues(values: SettlementAccount): SettlementAccountErrors {
  const errors: SettlementAccountErrors = {};

  if (!values.bank) errors.bank = "은행을 선택해주세요.";

  if (values.accountNumber === "") {
    errors.accountNumber = "계좌 번호를 입력해주세요.";
  } else if (!DIGITS_ONLY.test(values.accountNumber)) {
    errors.accountNumber = "숫자만 입력해주세요.";
  } else if (values.accountNumber.length < MIN_ACCOUNT_LENGTH) {
    errors.accountNumber = "계좌 번호를 정확히 입력해주세요.";
  }

  if (values.holderName.trim() === "") {
    errors.holderName = "예금주명을 입력해주세요.";
  } else if (!values.holderVerified) {
    errors.holderName = "예금주명을 확인해주세요.";
  }

  return errors;
}

/**
 * 정산 계좌 입력 상태
 *
 * 예금주명은 은행·계좌번호로 실명 조회를 거쳐야 하므로, 셋 중 하나라도 바뀌면
 * 확인 상태를 초기화합니다.
 */
export function useSettlementAccountForm(
  initialValues: SettlementAccount = EMPTY_SETTLEMENT_ACCOUNT,
): SettlementAccountForm {
  const [values, setValues] = useState<SettlementAccount>(initialValues);
  const [errors, setErrors] = useState<SettlementAccountErrors>({});

  const clearError = (field: keyof SettlementAccountErrors) => {
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
  };

  return {
    values,
    errors,
    setBank: (bank) => {
      setValues((current) => ({ ...current, bank, holderVerified: false }));
      clearError("bank");
    },
    setAccountNumber: (accountNumber) => {
      setValues((current) => ({ ...current, accountNumber, holderVerified: false }));
      clearError("accountNumber");
    },
    setHolderName: (holderName) => {
      setValues((current) => ({ ...current, holderName, holderVerified: false }));
      clearError("holderName");
    },
    setReceipt: (receipt) => setValues((current) => ({ ...current, receipt })),
    /*
     * TODO: 실명 조회 API가 생기면 여기서 호출하고 응답으로 예금주명을 채우세요.
     * 지금은 입력값이 있으면 확인된 것으로 처리합니다.
     */
    verifyHolder: () => {
      setValues((current) =>
        current.holderName.trim() === "" ? current : { ...current, holderVerified: true },
      );
      clearError("holderName");
    },
    validate: () => {
      const nextErrors = validateValues(values);
      setErrors(nextErrors);
      return Object.keys(nextErrors).length === 0 ? values : null;
    },
  };
}

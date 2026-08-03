import type { BankCode } from "./bank";

/** 수수료 영수증 발급 신청 여부 (Figma 703:16525 — 신청 · 신청 안 함) */
export type ReceiptRequest = "requested" | "notRequested";

/** 정산 대금 입금계좌 */
export interface SettlementAccount {
  bank: BankCode | null;
  accountNumber: string;
  holderName: string;
  /** 예금주 실명 확인 완료 여부 */
  holderVerified: boolean;
  receipt: ReceiptRequest;
}

export const EMPTY_SETTLEMENT_ACCOUNT: SettlementAccount = {
  bank: null,
  accountNumber: "",
  holderName: "",
  holderVerified: false,
  receipt: "notRequested",
};

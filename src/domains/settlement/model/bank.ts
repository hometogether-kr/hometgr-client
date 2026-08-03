/** 정산 계좌 은행 (Figma: 정산대금 입금계좌, node 703:16510) */
export type BankCode =
  | "kb"
  | "shinhan"
  | "woori"
  | "hana"
  | "nh"
  | "ibk"
  | "kakao"
  | "toss"
  | "sc"
  | "citi"
  | "post"
  | "saemaul"
  | "shinhyup"
  | "busan"
  | "daegu"
  | "gwangju"
  | "jeonbuk"
  | "jeju"
  | "kyongnam";

export interface BankOption {
  value: BankCode;
  label: string;
}

/**
 * TODO: 은행 목록은 서버가 내려주는 값으로 교체하세요.
 * Figma에는 "국민은행" 한 건만 예시로 있어 국내 주요 은행으로 채웠습니다.
 */
export const BANK_OPTIONS: readonly BankOption[] = [
  { value: "kb", label: "국민은행" },
  { value: "shinhan", label: "신한은행" },
  { value: "woori", label: "우리은행" },
  { value: "hana", label: "하나은행" },
  { value: "nh", label: "농협은행" },
  { value: "ibk", label: "기업은행" },
  { value: "kakao", label: "카카오뱅크" },
  { value: "toss", label: "토스뱅크" },
  { value: "sc", label: "SC제일은행" },
  { value: "citi", label: "씨티은행" },
  { value: "post", label: "우체국" },
  { value: "saemaul", label: "새마을금고" },
  { value: "shinhyup", label: "신협" },
  { value: "busan", label: "부산은행" },
  { value: "daegu", label: "대구은행" },
  { value: "gwangju", label: "광주은행" },
  { value: "jeonbuk", label: "전북은행" },
  { value: "jeju", label: "제주은행" },
  { value: "kyongnam", label: "경남은행" },
] as const;

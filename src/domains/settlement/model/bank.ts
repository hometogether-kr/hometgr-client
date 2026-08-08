/** 정산 계좌 은행 (Figma: 은행 선택 모달, node 703:23475) */
export type BankCode =
  | "nh"
  | "kakao"
  | "kb"
  | "toss"
  | "shinhan"
  | "woori"
  | "ibk"
  | "hana"
  | "saemaul"
  | "busan"
  | "im"
  | "kbank"
  | "shinhyup"
  | "post"
  | "sc"
  | "kyongnam"
  | "gwangju"
  | "suhyup"
  | "jeonbuk"
  | "savings"
  | "jeju"
  | "citi"
  | "kdb"
  | "forest";

export interface BankOption {
  value: BankCode;
  label: string;
}

/**
 * 은행 목록 — 표기와 순서 모두 Figma 은행 선택 모달(703:23475)을 따릅니다.
 *
 * TODO: 은행 목록을 서버가 내려주게 되면 이 상수를 API 응답으로 교체하고,
 * BankSelectModal에 loading을 넘겨 스켈레톤을 노출하세요.
 */
export const BANK_OPTIONS: readonly BankOption[] = [
  { value: "nh", label: "NH 농협" },
  { value: "kakao", label: "카카오뱅크" },
  { value: "kb", label: "KB국민" },
  { value: "toss", label: "토스뱅크" },
  { value: "shinhan", label: "신한" },
  { value: "woori", label: "우리" },
  { value: "ibk", label: "IBK기업" },
  { value: "hana", label: "하나" },
  { value: "saemaul", label: "새마을" },
  { value: "busan", label: "부산" },
  { value: "im", label: "iM뱅크(대구)" },
  { value: "kbank", label: "케이뱅크" },
  { value: "shinhyup", label: "신협" },
  { value: "post", label: "우체국" },
  { value: "sc", label: "SC제일" },
  { value: "kyongnam", label: "경남" },
  { value: "gwangju", label: "광주" },
  { value: "suhyup", label: "수협" },
  { value: "jeonbuk", label: "전북" },
  { value: "savings", label: "저축은행" },
  { value: "jeju", label: "제주" },
  { value: "citi", label: "씨티" },
  { value: "kdb", label: "KDB산업" },
  { value: "forest", label: "산림조합" },
] as const;

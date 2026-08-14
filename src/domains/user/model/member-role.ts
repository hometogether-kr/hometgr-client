/** 회원 유형 — host(방을 내놓는 사람) · guest(방을 찾는 사람) */
export type MemberRole = "host" | "guest";

/** 헤더·사이드바에서 사용자 이름 아래에 붙는 짧은 회원 유형 라벨 */
export const MEMBER_ROLE_LABEL: Record<MemberRole, string> = {
  host: "집주인 회원",
  guest: "입주자 회원",
};

export interface MemberRoleOption {
  role: MemberRole;
  /** 회원 유형 선택 화면의 카드 제목 */
  title: string;
  description: string;
  /** 데스크톱 카드 안의 CTA 문구 */
  ctaLabel: string;
}

/** Figma: 어떤 목적으로 이용하시나요? (643:19159 · 693:14014) */
export const MEMBER_ROLE_OPTIONS: readonly MemberRoleOption[] = [
  {
    role: "guest",
    title: "저는 방을 찾고 있어요",
    description: "원하는 방을 둘러보고 방문 예약이나 상담을 진행할 수 있어요.",
    ctaLabel: "입주자로 시작하기",
  },
  {
    role: "host",
    title: "저는 방을 내놓고 싶어요",
    description: "내 방을 등록하고 방문 일정과 상담을 관리할 수 있어요.",
    ctaLabel: "집주인으로 시작하기",
  },
] as const;

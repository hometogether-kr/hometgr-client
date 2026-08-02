import type { MemberRole } from "./member-role";

/**
 * 서버 사용자 권한 (OpenAPI: UserRole)
 *
 * 화면에서 다루는 `MemberRole`(host·guest)보다 넓습니다. 관리자 권한이 여기에 포함됩니다.
 */
export type UserRole =
  | "student"
  | "host"
  | "admin"
  | "superAdmin"
  | "roomManager"
  | "reservationManager"
  | "paymentManager"
  | "csManager";

/** 로그인한 사용자 — 온보딩 전에는 이름·연락처가 비어 있을 수 있습니다. */
export interface CurrentUser {
  id: string;
  role: UserRole;
  /** 화면에서 쓰는 회원 유형. 관리자 계정이면 null */
  memberRole: MemberRole | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  introduction: string | null;
  isOnboarded: boolean;
}

/** 현재 세션 상태 — 비로그인 상태도 하나의 값으로 표현합니다. */
export interface Session {
  isAuthenticated: boolean;
  /** 필수 온보딩(약관 동의·회원 유형·기본 정보)이 남았는지 */
  onboardingRequired: boolean;
  user: CurrentUser | null;
}

export const ANONYMOUS_SESSION: Session = {
  isAuthenticated: false,
  onboardingRequired: false,
  user: null,
};

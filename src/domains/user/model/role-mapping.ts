import type { UserRole } from "./current-user";
import type { MemberRole } from "./member-role";

/**
 * 화면의 회원 유형 ↔ 서버 권한 매핑
 *
 * 화면은 "입주자(guest)"라고 부르지만 서버 계약은 `student`입니다. 이 차이를
 * 도메인 경계에서 한 번만 흡수해 상위 레이어가 서버 표현을 몰라도 되게 합니다.
 */
const MEMBER_ROLE_TO_USER_ROLE: Record<MemberRole, Extract<UserRole, "student" | "host">> = {
  guest: "student",
  host: "host",
};

const USER_ROLE_TO_MEMBER_ROLE: Partial<Record<UserRole, MemberRole>> = {
  student: "guest",
  host: "host",
};

export function toUserRole(memberRole: MemberRole): "student" | "host" {
  return MEMBER_ROLE_TO_USER_ROLE[memberRole];
}

/** 관리자 계열 권한은 화면의 회원 유형으로 표현할 수 없어 null을 돌려줍니다. */
export function toMemberRole(userRole: UserRole): MemberRole | null {
  return USER_ROLE_TO_MEMBER_ROLE[userRole] ?? null;
}

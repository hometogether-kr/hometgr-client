import type { CurrentUser, Session } from "../model/current-user";
import { toMemberRole } from "../model/role-mapping";
import type { MeResponseDto, UserProfileDto } from "./user.dto";

export function toCurrentUser(dto: UserProfileDto): CurrentUser {
  return {
    id: dto.id,
    role: dto.role,
    memberRole: toMemberRole(dto.role),
    name: dto.name,
    email: dto.email,
    phone: dto.phone,
    introduction: dto.introduction,
    isOnboarded: dto.onboardingCompletedAt !== null,
  };
}

export function toSession(dto: MeResponseDto): Session {
  return {
    isAuthenticated: true,
    onboardingRequired: dto.onboardingRequired,
    user: toCurrentUser(dto.user),
  };
}

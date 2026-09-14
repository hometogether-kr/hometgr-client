import type { ConsentStateItem, UserConsents } from "../model/consent";
import type { CurrentUser, Session } from "../model/current-user";
import { toMemberRole } from "../model/role-mapping";
import type { ConsentStateItemDto, MeConsentsDto, MeResponseDto, UserProfileDto } from "./user.dto";

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

export function toConsentStateItem(dto: ConsentStateItemDto): ConsentStateItem {
  return {
    key: dto.key,
    agreed: dto.agreed,
    policyVersion: dto.policyVersion,
    required: dto.required,
    agreedAt: dto.agreedAt,
  };
}

export function toUserConsents(dto: MeConsentsDto): UserConsents {
  return {
    items: dto.items.map(toConsentStateItem),
    requiredSatisfied: dto.requiredSatisfied,
  };
}

export function toSession(dto: MeResponseDto): Session {
  return {
    isAuthenticated: true,
    onboardingRequired: dto.onboardingRequired,
    user: toCurrentUser(dto.user),
    consents: dto.consents ? toUserConsents(dto.consents) : null,
  };
}

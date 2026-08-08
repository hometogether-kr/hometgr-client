"use client";

import { useState } from "react";

import type { CurrentUser, MemberRole } from "@/domains/user";
import { Icon } from "@/shared/ui/icons";
import { TextField } from "@/shared/ui/text-field";

import { AccountSection } from "./account-section";
import { SaveButton } from "./save-button";

export interface ProfileSectionProps {
  user: CurrentUser;
  memberRole: MemberRole;
  onSaveIntroduction?: (introduction: string) => void;
  onRequestRoleSwitch?: () => void;
}

/** 집주인은 입주자로, 입주자는 집주인으로 전환을 요청합니다. */
const SWITCH_LABEL: Record<MemberRole, string> = {
  host: "입주자로 계정 전환 요청하기",
  guest: "집주인으로 계정 전환 요청하기",
};

const SECTION_TITLE: Record<MemberRole, string> = {
  host: "집주인 정보",
  guest: "입주자 정보",
};

const INTRODUCTION_LABEL: Record<MemberRole, string> = {
  host: "집주인 소개",
  guest: "입주자 소개",
};

/**
 * 계정 기본 정보 (Figma: 646:26535 집주인 · 646:27147 입주자)
 *
 * 카카오 계정·이름·휴대폰 번호는 카카오에서 받아온 값이라 읽기 전용이고,
 * 소개만 이 화면에서 수정합니다.
 */
export function ProfileSection({
  user,
  memberRole,
  onSaveIntroduction,
  onRequestRoleSwitch,
}: ProfileSectionProps) {
  const [introduction, setIntroduction] = useState(user.introduction ?? "");

  return (
    <AccountSection
      title={SECTION_TITLE[memberRole]}
      action={
        <button
          type="button"
          onClick={onRequestRoleSwitch}
          className="flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-grayscale-300 px-4 py-2 text-label-2 font-semibold text-grayscale-600 transition-opacity hover:opacity-80"
        >
          <span className="flex size-4 items-center justify-center">
            <Icon name="sync_alt" size={16} />
          </span>
          {SWITCH_LABEL[memberRole]}
        </button>
      }
    >
      {/* 모바일은 필드 간격 28px, 데스크톱은 24px (Figma 714:4458 · 646:26541) */}
      <div className="flex flex-col gap-7 md:gap-6">
        {/* 카카오에서 받아온 값이라 이 화면에서는 수정할 수 없습니다. */}
        <TextField label="카카오 계정 (이메일)" value={user.email ?? ""} disabled />
        <TextField label="이름" value={user.name ?? ""} disabled />
        <TextField label="휴대폰 번호" value={user.phone ?? ""} disabled />
        <TextField
          label={INTRODUCTION_LABEL[memberRole]}
          placeholder="소개를 입력해주세요"
          value={introduction}
          onChange={(event) => setIntroduction(event.target.value)}
          action={<SaveButton onClick={() => onSaveIntroduction?.(introduction)} />}
        />
      </div>
    </AccountSection>
  );
}

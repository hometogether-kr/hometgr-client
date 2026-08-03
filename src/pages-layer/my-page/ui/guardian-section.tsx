"use client";

import { useState } from "react";
import { GUARDIAN_RELATION_OPTIONS } from "@/domains/user";
import type { GuardianRelation } from "@/domains/user";
import { ChipNormal } from "@/shared/ui/chip-normal";
import { TextField } from "@/shared/ui/text-field";
import { AccountSection } from "./account-section";
import { SaveButton } from "./save-button";

export interface GuardianSectionProps {
  initialPhone?: string | null;
  initialRelation?: GuardianRelation | null;
  onSavePhone?: (phone: string) => void;
  onSelectRelation?: (relation: GuardianRelation) => void;
}

/** 숫자만 허용 — Figma 646:26187의 "숫자만 입력해주세요." 상태 */
const DIGITS_ONLY = /^\d*$/;

function validatePhone(value: string): string | undefined {
  if (!DIGITS_ONLY.test(value)) return "숫자만 입력해주세요.";
  if (value.length > 0 && value.length < 10) return "휴대폰 번호를 정확히 입력해주세요.";
  return undefined;
}

/**
 * 보호자 정보 (입주자 전용, Figma: 646:26187 · 646:27147)
 *
 * 비상 연락처와 관계를 저장합니다. 관계 칩은 하나만 고를 수 있습니다.
 */
export function GuardianSection({
  initialPhone,
  initialRelation,
  onSavePhone,
  onSelectRelation,
}: GuardianSectionProps) {
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [relation, setRelation] = useState<GuardianRelation | null>(initialRelation ?? null);
  const [error, setError] = useState<string>();

  const handleSave = () => {
    const message = validatePhone(phone);
    setError(message);
    if (message) return;
    onSavePhone?.(phone);
  };

  const handleRelationSelect = (value: GuardianRelation) => {
    setRelation(value);
    onSelectRelation?.(value);
  };

  return (
    <AccountSection title="보호자 정보 (비상 연락처)">
      <div className="flex flex-col gap-6">
        <TextField
          label="휴대폰 번호"
          inputMode="numeric"
          placeholder="01012345678"
          value={phone}
          error={error}
          onChange={(event) => {
            setPhone(event.target.value);
            if (error) setError(undefined);
          }}
          action={<SaveButton onClick={handleSave} />}
        />

        <fieldset className="flex flex-col gap-2">
          <legend className="pb-2 text-label-1 font-medium text-grayscale-600">관계 선택</legend>
          <div className="flex flex-wrap gap-2">
            {GUARDIAN_RELATION_OPTIONS.map((option) => (
              <ChipNormal
                key={option.value}
                selected={relation === option.value}
                onClick={() => handleRelationSelect(option.value)}
              >
                {option.label}
              </ChipNormal>
            ))}
          </div>
        </fieldset>
      </div>
    </AccountSection>
  );
}

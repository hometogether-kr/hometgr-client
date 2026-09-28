"use client";

import { useState } from "react";

import { formatKoreanPhoneInput } from "@/shared/lib/korean-phone";
import { BtnCta } from "@/shared/ui/btn-cta";
import { TextField } from "@/shared/ui/text-field";

import {
  onboardingProfileSchema,
  type OnboardingProfileValues,
} from "../model/onboarding-profile.schema";

interface OnboardingProfileFormProps {
  initialName?: string;
  initialPhone?: string;
  isSubmitting: boolean;
  error?: string;
  onSubmit: (values: OnboardingProfileValues) => void;
}

export function OnboardingProfileForm({
  initialName = "",
  initialPhone = "",
  isSubmitting,
  error,
  onSubmit,
}: OnboardingProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(formatKoreanPhoneInput(initialPhone));
  const [submitted, setSubmitted] = useState(false);
  const parsed = onboardingProfileSchema.safeParse({ name, phone });
  const fieldError = (field: keyof OnboardingProfileValues) =>
    submitted && !parsed.success
      ? parsed.error.issues.find((issue) => issue.path[0] === field)?.message
      : undefined;

  return (
    <form
      noValidate
      aria-busy={isSubmitting}
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        if (isSubmitting) return;
        setSubmitted(true);
        if (parsed.success) onSubmit(parsed.data);
      }}
    >
      <div className="min-h-[104px]">
        <TextField
          label="이름"
          name="name"
          autoComplete="name"
          placeholder="홍길동"
          value={name}
          maxLength={100}
          disabled={isSubmitting}
          error={fieldError("name")}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <div className="min-h-[104px]">
        <TextField
          label="휴대폰 번호"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="010-1234-5678"
          value={phone}
          maxLength={20}
          disabled={isSubmitting}
          error={fieldError("phone")}
          onChange={(event) => setPhone(formatKoreanPhoneInput(event.target.value))}
        />
      </div>
      <div className="min-h-6 text-label-2 text-system-error" aria-live="polite">
        {error && <p role="alert">{error}</p>}
      </div>
      <BtnCta type="submit" size="l" className="w-full" loading={isSubmitting}>
        {isSubmitting ? "가입 처리 중" : "가입 완료"}
      </BtnCta>
    </form>
  );
}

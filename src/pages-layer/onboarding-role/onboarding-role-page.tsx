"use client";

import { Fragment, useState } from "react";
import { MEMBER_ROLE_OPTIONS } from "@/domains/user";
import type { MemberRole } from "@/domains/user";
import { BtnCta } from "@/shared/ui/btn-cta";
import { ChoiceCard } from "@/shared/ui/choice-card";
import { useToast } from "@/shared/ui/toast";
import { OnboardingLayout } from "@/widgets/onboarding-layout";

/**
 * TODO: 아래 일러스트는 7일 후 만료되는 Figma 임시 URL입니다.
 * export해 public/에 커밋한 뒤 next/image로 교체하세요.
 */
const FIGMA_TEMP_ILLUST: Record<MemberRole, string> = {
  guest: "/figma/guest-8204a620.svg",
  host: "/figma/host-8d61fc4c.svg",
};

/* eslint-disable @next/next/no-img-element -- 임시 Figma 에셋, 커밋된 이미지로 교체 예정 */

/**
 * 데스크톱은 입주자 컬럼이 왼쪽(Figma 643:19159), 모바일은 집주인 카드가
 * 위(Figma 693:14014)라 모바일에서만 순서를 뒤집습니다.
 */
const MOBILE_ROLE_OPTIONS = [...MEMBER_ROLE_OPTIONS].reverse();

export interface OnboardingRolePageProps {
  onSelect?: (role: MemberRole) => void;
  onBack?: () => void;
}

/**
 * 회원 유형 선택
 *
 * - 데스크톱(Figma 643:19159): 카드 위에 제목, 카드 안에 2단 컬럼.
 *   각 컬럼의 CTA를 누르면 바로 해당 유형으로 진행합니다.
 * - 모바일(Figma 693:14014·14191·14277): 선택 카드 2장 + 하단 고정 "다음으로"
 */
export function OnboardingRolePage({ onSelect, onBack }: OnboardingRolePageProps) {
  const [selectedRole, setSelectedRole] = useState<MemberRole | null>(null);
  const { showToast } = useToast();

  const handleNext = () => {
    if (!selectedRole) {
      showToast("회원 유형을 선택해주세요", { variant: "error" });
      return;
    }
    onSelect?.(selectedRole);
  };

  return (
    <OnboardingLayout
      title="어떤 목적으로 이용하시나요?"
      description="원하시는 회원 유형을 선택해주세요."
      onBack={onBack}
      cardWidth="wide"
      titlePlacement="above-card"
      footerPlacement="mobile"
      footer={
        <BtnCta size="mobile" aria-disabled={!selectedRole} className="w-full" onClick={handleNext}>
          다음으로
        </BtnCta>
      }
    >
      {/* 모바일: 선택 카드 2장 */}
      <div className="flex flex-col gap-2 md:hidden">
        {MOBILE_ROLE_OPTIONS.map((option) => (
          <ChoiceCard
            key={option.role}
            title={option.title}
            description={option.description}
            selected={selectedRole === option.role}
            onClick={() => setSelectedRole(option.role)}
            illustration={
              <img
                alt=""
                src={FIGMA_TEMP_ILLUST[option.role]}
                className="block h-[164px] max-w-full object-contain"
              />
            }
          />
        ))}
      </div>

      {/* 데스크톱: 세로 구분선으로 나뉜 2단 컬럼, 각 컬럼에 CTA */}
      <div className="hidden md:flex md:items-stretch md:justify-center md:gap-12">
        {MEMBER_ROLE_OPTIONS.map((option, index) => (
          <Fragment key={option.role}>
            {index > 0 && (
              <div aria-hidden="true" className="w-px shrink-0 self-stretch bg-grayscale-200" />
            )}
            <div className="flex w-[398px] flex-col items-center justify-center gap-7">
              <div className="flex w-full flex-col">
                <h2 className="text-title-3 font-semibold text-grayscale-900">{option.title}</h2>
                <p className="text-body-1 font-medium text-grayscale-700">{option.description}</p>
              </div>
              <div className="flex h-[220px] w-[284px] items-center justify-center overflow-clip">
                <img
                  alt=""
                  src={FIGMA_TEMP_ILLUST[option.role]}
                  className="block max-h-full max-w-full object-contain"
                />
              </div>
              <BtnCta size="l" className="w-full" onClick={() => onSelect?.(option.role)}>
                {option.ctaLabel}
              </BtnCta>
            </div>
          </Fragment>
        ))}
      </div>
    </OnboardingLayout>
  );
}

import type { ReactNode } from "react";

import { BtnCta } from "@/shared/ui/btn-cta";
import { ProgressBar } from "@/shared/ui/progress-bar";
import { ResponsiveHeader } from "@/widgets/responsive-header";

import { ListingStepper } from "./listing-stepper";
import { LISTING_STEPS, type ListingStepIndex } from "./listing-steps";

export interface ListingStepLayoutProps {
  /** 현재 단계 (1~10) */
  step: ListingStepIndex;
  /** 카드 상단 회색 라벨 (기본: 해당 단계 이름) — 데스크톱 전용 */
  eyebrow?: string;
  title: string;
  description?: string;
  /** 폼 본문 */
  children: ReactNode;
  onPrev?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  autoSaving?: boolean;
}

/**
 * 매물 등록 단계 공통 레이아웃
 *
 * - 데스크톱(md~, Figma node 420:6674): Navigation + 폼 카드 + 우측 진행 단계 사이드바,
 *   카드 하단에 이전/다음 버튼
 * - 모바일(~md, Figma node 541:21824): GnbMobile + 상단 진행바("n/10") + 단일 컬럼,
 *   하단 고정 "다음으로" 버튼 (뒤로가기는 GNB의 back 버튼이 담당)
 */
export function ListingStepLayout({
  step,
  eyebrow,
  title,
  description,
  children,
  onPrev,
  onNext,
  nextLabel = "다음으로",
  nextDisabled,
  autoSaving,
}: ListingStepLayoutProps) {
  const totalSteps = LISTING_STEPS.length;

  return (
    <div className="min-h-screen bg-white md:bg-grayscale-50">
      <ResponsiveHeader
        mobile={{ variant: "title", title: LISTING_STEPS[step - 1], onBack: onPrev }}
      />

      <main className="flex justify-center px-5 pt-4 pb-[104px] md:px-4 md:pt-[100px] md:pb-[152px]">
        <div className="flex w-full flex-col items-start gap-4 md:w-auto md:flex-row md:items-start md:gap-6">
          {/* 모바일 진행 표시 */}
          <div className="flex w-full flex-col gap-2 md:hidden">
            <ProgressBar value={step} max={totalSteps} />
            <p className="text-[13px] leading-[1.4] font-medium text-grayscale-500">
              {step}/{totalSteps}
            </p>
          </div>

          <section className="flex w-full flex-col justify-between md:min-h-[720px] md:w-[850px] md:rounded-[20px] md:bg-white md:px-10 md:py-8">
            <div className="flex w-full flex-col gap-3">
              <p className="hidden text-base leading-[1.5] font-medium whitespace-nowrap text-grayscale-500 md:block">
                {eyebrow ?? LISTING_STEPS[step - 1]}
              </p>
              <div className="flex w-full flex-col gap-6 md:gap-9">
                <div className="flex w-full flex-col gap-2 md:max-w-[729px] md:gap-2.5">
                  <h1 className="text-[22px] leading-[1.4] font-semibold tracking-[-0.22px] text-grayscale-900 md:text-[28px] md:leading-[1.3] md:tracking-[-0.28px]">
                    {title}
                  </h1>
                  {description && (
                    <p className="text-sm leading-[1.5] font-medium text-grayscale-600 md:text-lg md:leading-[1.4] md:tracking-[-0.18px]">
                      {description}
                    </p>
                  )}
                </div>
                {children}
              </div>
            </div>

            {/* 데스크톱 하단 버튼 */}
            <div className="hidden w-full justify-end pt-8 md:flex">
              <div className="flex items-start gap-3">
                <BtnCta variant="stroke" size="m" className="h-11 w-auto" onClick={onPrev}>
                  이전으로
                </BtnCta>
                <BtnCta size="m" className="w-[196px]" onClick={onNext} disabled={nextDisabled}>
                  {nextLabel}
                </BtnCta>
              </div>
            </div>
          </section>

          <div className="hidden md:block">
            <ListingStepper current={step} autoSaving={autoSaving} />
          </div>
        </div>
      </main>

      {/* 모바일 하단 고정 버튼 */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-grayscale-100 bg-white px-5 pt-2 pb-6 md:hidden">
        <BtnCta size="mobile" className="w-full" onClick={onNext} disabled={nextDisabled}>
          {nextLabel}
        </BtnCta>
      </div>
    </div>
  );
}

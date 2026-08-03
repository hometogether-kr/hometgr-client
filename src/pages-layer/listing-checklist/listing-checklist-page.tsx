"use client";

import type { ReactNode } from "react";

import { BtnCta } from "@/shared/ui/btn-cta";
import { GnbMobile } from "@/widgets/gnb-mobile";
import { Navigation } from "@/widgets/navigation";

/**
 * TODO: 아래 에셋은 7일 후 만료되는 Figma 임시 URL입니다.
 * 집 일러스트, ic_list(임시저장·소요시간·검수) 3종을 export해 커밋한 뒤 교체하세요.
 */
const FIGMA_TEMP_ILLUST_HOUSE = "/figma/illust-house-7712687f.svg";
const FIGMA_TEMP_IC_DRAFT = "/figma/ic-draft-50416248.svg";
const FIGMA_TEMP_IC_TIME = "/figma/ic-time-7d434f72.svg";
const FIGMA_TEMP_IC_REVIEW = "/figma/ic-review-8d5042da.svg";

/* eslint-disable @next/next/no-img-element -- 임시 Figma 에셋, 커밋된 SVG로 교체 예정 */

const CHECKLIST = [
  {
    icon: FIGMA_TEMP_IC_DRAFT,
    title: (
      <>
        임시저장 후 <span className="text-primary-500">이어쓰기</span>
      </>
    ),
    description: "작성 중 중간에 나가셔도 이어서 작성하실 수 있습니다.",
  },
  {
    icon: FIGMA_TEMP_IC_TIME,
    title: (
      <>
        예상 소요시간 <span className="text-primary-500">3</span>분
      </>
    ),
    description: "주소, 거래조건, 방 사진을 미리 준비하시면 더 빠르게 완료됩니다.",
  },
  {
    icon: FIGMA_TEMP_IC_REVIEW,
    title: (
      <>
        <span className="text-primary-500">검수</span> 후 공개
      </>
    ),
    description: "운영자 확인 전에는 게스트 목록에 노출되지 않습니다.",
  },
] satisfies { icon: string; title: ReactNode; description: string }[];

export interface ListingChecklistPageProps {
  onStart?: () => void;
  onBack?: () => void;
  /** 초안을 만드는 동안 중복 생성을 막습니다. */
  isStarting?: boolean;
}

/**
 * 사전 체크리스트 (Figma: node 420:6637 · 541:21695)
 *
 * - 모바일: GNB + 단일 컬럼, 하단 고정 "시작하기"
 * - 데스크톱: 흰 카드(max-886px) 안에 배치, 카드 우측 하단 버튼
 */
export function ListingChecklistPage({
  onStart,
  onBack,
  isStarting = false,
}: ListingChecklistPageProps) {
  const startLabel = isStarting ? "준비 중..." : "시작하기";

  return (
    <div className="min-h-screen bg-white md:bg-grayscale-50">
      <div className="md:hidden">
        <GnbMobile variant="back" onBack={onBack} />
      </div>
      <div className="hidden md:block">
        <Navigation />
      </div>

      <main className="flex justify-center px-5 pt-12 pb-[104px] md:px-4 md:pt-[100px] md:pb-[100px]">
        <div className="flex w-full flex-col items-end gap-10 md:max-w-[886px] md:rounded-[20px] md:bg-white md:px-12 md:pt-12 md:pb-10">
          <div className="flex w-full flex-col items-center gap-6 md:gap-9">
            <div className="flex flex-col items-center gap-3 md:gap-8">
              <div className="relative size-10 overflow-clip md:size-[120px]">
                <img
                  alt=""
                  src={FIGMA_TEMP_ILLUST_HOUSE}
                  className="absolute inset-0 block size-full max-w-none object-contain"
                />
              </div>
              <h1 className="text-center text-[22px] leading-[1.4] font-semibold tracking-[-0.22px] text-grayscale-900 md:text-[32px] md:leading-[1.3] md:tracking-[-0.32px]">
                방 등록 신청, 3분이면 끝나요!
              </h1>
              <p className="max-w-[266px] text-center text-sm leading-[1.5] font-medium text-grayscale-600 md:hidden">
                직접 등록이 어려운 경우, 소유자의 동의를 받은 가족이나 보호자가 대신 등록할 수
                있어요.
              </p>
            </div>
            <ul className="flex w-full flex-col gap-8 rounded-2xl bg-grayscale-70 p-4 md:max-w-[790px] md:gap-16 md:rounded-[20px] md:border md:border-grayscale-200 md:bg-transparent md:px-8 md:py-10">
              {CHECKLIST.map((item, index) => (
                <li key={index} className="flex w-full items-center gap-4 md:gap-7">
                  <span className="flex size-6 shrink-0 items-center justify-center md:size-10">
                    <img
                      alt=""
                      src={item.icon}
                      className="block size-full max-w-none object-contain"
                    />
                  </span>
                  <div className="flex flex-col items-start gap-1">
                    <p className="text-base leading-[1.4] font-semibold text-grayscale-800 md:text-2xl md:tracking-[-0.24px]">
                      {item.title}
                    </p>
                    <p className="text-[13px] leading-[1.5] font-medium text-grayscale-600 md:text-base md:leading-[1.6] md:text-grayscale-700">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <BtnCta
            size="m"
            className="hidden w-[196px] md:inline-flex"
            onClick={onStart}
            disabled={isStarting}
          >
            {startLabel}
          </BtnCta>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-grayscale-100 bg-white px-5 pt-2 pb-6 md:hidden">
        <BtnCta size="mobile" className="w-full" onClick={onStart} disabled={isStarting}>
          {startLabel}
        </BtnCta>
      </div>
    </div>
  );
}

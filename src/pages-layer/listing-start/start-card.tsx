import Link from "next/link";
import type { ReactNode } from "react";
import { BtnIc } from "@/shared/ui/btn-ic";

const IC_DIAGONAL_ARROW = "/icons/ic-diagonal-arrow.svg";

/* eslint-disable @next/next/no-img-element -- 임시 Figma 에셋, 커밋된 SVG로 교체 예정 */

interface StartCardBaseProps {
  title: string;
  description: string;
  illustration: ReactNode;
  /** 데스크톱 카드 하단 문구 (기본: "등록하기") */
  actionLabel?: string;
}

const CARD_CLASS_NAME =
  "flex w-full flex-col items-start rounded-2xl bg-white px-5 py-4 text-left md:w-[568px] md:rounded-[32px] md:px-9 md:py-10";

function CardBody({ title, description, illustration, actionLabel = "등록하기" }: StartCardBaseProps) {
  return (
    <div className="flex w-full flex-col items-start gap-4 md:gap-16">
      <div className="flex flex-col items-start gap-2 md:whitespace-nowrap">
        <h2 className="text-lg font-semibold leading-[1.4] text-grayscale-900 md:text-[32px] md:font-bold md:leading-[52px]">
          {title}
        </h2>
        <p className="text-sm font-medium leading-[1.5] text-grayscale-600 md:text-2xl md:leading-[1.54]">
          {description}
        </p>
      </div>
      <div className="flex w-full items-end justify-end md:justify-between">
        <span className="hidden items-center gap-5 md:flex">
          <BtnIc size="64" label={`${title} 시작하기`} className="pointer-events-none">
            <img alt="" src={IC_DIAGONAL_ARROW} className="block size-[18.6px] max-w-none" />
          </BtnIc>
          <span className="whitespace-nowrap text-2xl font-medium leading-[1.54] text-grayscale-600">
            {actionLabel}
          </span>
        </span>
        <div className="relative size-[84px] overflow-clip md:size-[172px]">{illustration}</div>
      </div>
    </div>
  );
}

export interface StartLinkCardProps extends StartCardBaseProps {
  href: string;
}

/**
 * - 모바일(Figma 538:18748): 세로 스택 카드, 우측 하단 84px 일러스트
 * - 데스크톱(Figma 420:6593): 568px 카드 2열, 172px 일러스트 + "등록하기" 링크
 */
export function StartLinkCard({ href, ...cardProps }: StartLinkCardProps) {
  return (
    <Link href={href} className={CARD_CLASS_NAME}>
      <CardBody {...cardProps} />
    </Link>
  );
}

export interface StartButtonCardProps extends StartCardBaseProps {
  onClick?: () => void;
  disabled?: boolean;
}

/** 이동 전에 확인할 값이 있어 링크로 만들 수 없는 카드 */
export function StartButtonCard({ onClick, disabled, ...cardProps }: StartButtonCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${CARD_CLASS_NAME} disabled:cursor-not-allowed disabled:opacity-60`}
    >
      <CardBody {...cardProps} />
    </button>
  );
}

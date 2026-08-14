import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

export type BtnUnderlineSize = "12" | "13" | "14" | "16";
export type BtnUnderlineTone = "default" | "muted";

interface BtnUnderlineBaseProps {
  size?: BtnUnderlineSize;
  /** default: grayscale-700(약관 보기) · muted: grayscale-500(회원 탈퇴) */
  tone?: BtnUnderlineTone;
  className?: string;
  children: ReactNode;
}

export interface BtnUnderlineProps
  extends
    BtnUnderlineBaseProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BtnUnderlineBaseProps> {
  /** 지정하면 button 대신 링크로 렌더링합니다. */
  href?: string;
}

const sizeClasses: Record<BtnUnderlineSize, string> = {
  "12": "text-caption-1",
  "13": "text-label-2",
  "14": "text-label-1",
  "16": "text-body-1",
};

const baseClasses =
  "inline-flex shrink-0 items-center justify-center whitespace-nowrap border-b border-solid font-medium transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:opacity-40";

const toneClasses: Record<BtnUnderlineTone, string> = {
  default: "border-grayscale-700 text-grayscale-700",
  muted: "border-grayscale-500 text-grayscale-500",
};

/**
 * 밑줄 텍스트 버튼 (Figma: btn_ic/btn_cta/Underline text, node 277:1497)
 *
 * 약관 보기·자세히 보기처럼 본문 옆에 붙는 보조 액션에 사용합니다.
 * 밑줄은 텍스트와 간격을 두는 Figma 디자인에 맞춰 border-b로 그립니다.
 */
export function BtnUnderline({
  size = "14",
  tone = "default",
  href,
  className,
  children,
  ...rest
}: BtnUnderlineProps) {
  const classes = cn(baseClasses, sizeClasses[size], toneClasses[tone], className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  );
}

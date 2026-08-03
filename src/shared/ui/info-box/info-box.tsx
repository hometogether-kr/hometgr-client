import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export interface InfoBoxProps extends HTMLAttributes<HTMLDivElement> {
  /** Figma: title — 있으면 아이콘+제목 행 아래 본문, 없으면 아이콘+본문 한 줄 */
  title?: string;
  /**
   * 좌측 인포 아이콘 (Figma: ic_info, 20px).
   * TODO: 기본값은 7일 후 만료되는 Figma 임시 에셋 URL — Figma에서 ic_info를
   * SVG로 export해 public/icons/ic-info.svg로 커밋한 뒤 교체하세요.
   */
  icon?: ReactNode;
  children: ReactNode;
}

/** 원과 느낌표가 하나로 합쳐진 20×20 아이콘 */
const IC_INFO = "/icons/ic-info.svg";

function DefaultInfoIcon() {
  return (
    <span className="block size-5" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element -- next/image는 dangerouslyAllowSVG 없이 SVG를 막습니다 */}
      <img alt="" src={IC_INFO} className="block size-full max-w-none" />
    </span>
  );
}

/**
 * 인포 박스 (Figma: info, node 367:6256)
 *
 * - bg grayscale-70 · rounded-12 · p-16
 * - title 있음: [아이콘+제목(15px semibold)] 행 + 본문(14px medium)
 * - title 없음: 아이콘 + 본문 한 줄
 * - Figma의 고정 너비(770px)는 예시 값 — 기본 w-full
 */
export function InfoBox({ title, icon, className, children, ...rest }: InfoBoxProps) {
  const infoIcon = (
    <span className="flex size-5 shrink-0 items-center justify-center">
      {icon ?? <DefaultInfoIcon />}
    </span>
  );

  return (
    <div
      className={cn("w-full rounded-xl bg-grayscale-70 p-4", className)}
      {...rest}
    >
      {title ? (
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-1.5">
            {infoIcon}
            <p className="text-[15px] font-semibold leading-[1.5] text-grayscale-700">{title}</p>
          </div>
          <div className="text-sm font-medium leading-[1.5] text-grayscale-700">{children}</div>
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          {infoIcon}
          <div className="text-sm font-medium leading-[1.5] text-grayscale-700">{children}</div>
        </div>
      )}
    </div>
  );
}

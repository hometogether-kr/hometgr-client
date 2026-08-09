import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

import { BtnCta } from "../btn-cta";

export type ToastVariant = "info" | "error" | "success";

export interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  /** Figma: Property 1 (info · error · success) */
  variant?: ToastVariant;
  /** Figma: description — 제목 아래 추가 설명 */
  description?: ReactNode;
  /** Figma: btn=cta — 지정 시 우측에 BtnCta(xs) 표시 */
  actionLabel?: string;
  onAction?: () => void;
  /** Figma: btn=close — 지정 시 우측에 닫기(X) 버튼 표시 */
  onClose?: () => void;
  /** 닫기 아이콘 (Figma: ic_x_cancel). */
  closeIcon?: ReactNode;
  /** 토스트 문구 (제목) */
  children: ReactNode;
}

const VARIANT_ICON: Record<ToastVariant, string> = {
  info: "/icons/ic-info.svg",
  error: "/icons/ic-error.svg",
  success: "/icons/ic-success.svg",
};

const IC_CLOSE = "/icons/ic-x-cancel.svg";

/**
 * 토스트 (Figma: toast, node 424:12787)
 *
 * - bg white · rounded-12 · px-16 py-12 · shadow-toast
 * - 제목: 아이콘 20px + 16px semibold grayscale-700
 * - 설명: 좌측 24px 들여쓰기 · 14px medium grayscale-600
 * - 우측 버튼: actionLabel(BtnCta xs) 또는 onClose(X) 중 하나
 */
export function Toast({
  variant = "info",
  description,
  actionLabel,
  onAction,
  onClose,
  closeIcon,
  className,
  children,
  ...rest
}: ToastProps) {
  const hasAction = Boolean(actionLabel);
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "flex w-full max-w-[calc(100vw-40px)] gap-1.5 rounded-xl bg-white px-4 py-3 shadow-toast md:w-fit md:max-w-[480px]",
        hasAction ? "items-center" : "items-start",
        className,
      )}
      {...rest}
    >
      <div className="flex min-w-0 flex-col items-start">
        <div className="flex min-w-0 items-center gap-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element -- public SVG 아이콘은 next/image가 필요 없습니다 */}
          <img
            src={VARIANT_ICON[variant]}
            alt=""
            width={20}
            height={20}
            className="size-5 shrink-0"
            aria-hidden="true"
          />
          <p className="min-w-0 text-base leading-[1.5] font-semibold [word-break:keep-all] text-grayscale-700">
            {children}
          </p>
        </div>
        {description && (
          <div className="w-full pt-2 pl-6 text-sm leading-[1.5] font-medium [word-break:keep-all] text-grayscale-600">
            {description}
          </div>
        )}
      </div>
      {hasAction && (
        <div className="flex shrink-0 pl-1">
          <BtnCta size="xs" onClick={onAction}>
            {actionLabel}
          </BtnCta>
        </div>
      )}
      {!hasAction && onClose && (
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="flex shrink-0 items-center py-0.5"
        >
          <span className="flex size-5 items-center justify-center overflow-clip rounded-lg">
            {closeIcon ?? (
              // eslint-disable-next-line @next/next/no-img-element -- public SVG 아이콘은 next/image가 필요 없습니다
              <img alt="" src={IC_CLOSE} className="block size-[14px] max-w-none" />
            )}
          </span>
        </button>
      )}
    </div>
  );
}

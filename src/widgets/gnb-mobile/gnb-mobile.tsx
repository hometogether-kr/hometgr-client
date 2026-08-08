"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";

import { cn } from "@/shared/lib/cn";
import { Icon } from "@/shared/ui/icons";
import { SidebarMobile } from "@/widgets/sidebar-mobile";

/** 아이콘과 워드마크가 합쳐진 113×20 로고 */
const LOGO = "/images/logos/logo-s.svg";

interface GnbMobileBase {
  className?: string;
}

interface GnbMobileLogo extends GnbMobileBase {
  /** Figma: Property 1 = logo — 로고 + 햄버거 메뉴 */
  variant: "logo";
  /**
   * 지정하지 않으면 내장 SidebarMobile 드로어가 열립니다.
   * 외부에서 메뉴 상태를 관리할 때만 넘기세요.
   */
  onMenuClick?: () => void;
  menuIcon?: ReactNode;
}

interface GnbMobileBack extends GnbMobileBase {
  /** Figma: Property 1 = right ic — 뒤로가기만 */
  variant: "back";
  onBack?: () => void;
  backIcon?: ReactNode;
}

interface GnbMobileTitle extends GnbMobileBase {
  /** Figma: Property 1 = title — 뒤로가기 + 제목 */
  variant: "title";
  title: string;
  onBack?: () => void;
  backIcon?: ReactNode;
}

export type GnbMobileProps = GnbMobileLogo | GnbMobileBack | GnbMobileTitle;

function BackButton({ onBack, backIcon }: { onBack?: () => void; backIcon?: ReactNode }) {
  return (
    <button
      type="button"
      aria-label="뒤로 가기"
      onClick={onBack}
      className="absolute top-0 left-0 flex items-center p-2.5"
    >
      <span className="flex size-7 items-center justify-center">
        {backIcon ?? <Icon name="arrow_back_ios_new" size={20} />}
      </span>
    </button>
  );
}

/**
 * 모바일 GNB (Figma: gnb_mobile, node 541:22207)
 *
 * - logo: 로고 + 햄버거 (border-b grayscale-100 · px-20 py-8)
 * - back: 뒤로가기 아이콘만 (h-52)
 * - title: 뒤로가기 + 18px semibold 제목 (h-52)
 */
export function GnbMobile(props: GnbMobileProps) {
  const { className } = props;
  const [menuOpen, setMenuOpen] = useState(false);

  if (props.variant === "logo") {
    const { onMenuClick } = props;
    return (
      <>
        <header
          className={cn(
            "flex w-full items-center justify-between border-b border-grayscale-100 bg-white px-5 py-2",
            className,
          )}
        >
          <Link href="/" className="flex items-center py-2" aria-label="Home Together">
            {/* eslint-disable-next-line @next/next/no-img-element -- next/image는 dangerouslyAllowSVG 없이 SVG를 막습니다 */}
            <img src={LOGO} alt="Home Together" width={113} height={20} className="block" />
          </Link>
          <button
            type="button"
            aria-label="메뉴 열기"
            onClick={onMenuClick ?? (() => setMenuOpen(true))}
            className="flex items-center"
          >
            <span className="flex size-6 items-center justify-center">
              {props.menuIcon ?? <Icon name="menu" size={24} />}
            </span>
          </button>
        </header>
        {!onMenuClick && <SidebarMobile open={menuOpen} onClose={() => setMenuOpen(false)} />}
      </>
    );
  }

  return (
    <header className={cn("relative h-[52px] w-full overflow-clip bg-white", className)}>
      <BackButton onBack={props.onBack} backIcon={props.backIcon} />
      {props.variant === "title" && (
        <p className="absolute top-1/2 left-[38px] -translate-y-1/2 text-lg leading-[1.4] font-semibold tracking-[-0.18px] whitespace-nowrap text-grayscale-900">
          {props.title}
        </p>
      )}
    </header>
  );
}

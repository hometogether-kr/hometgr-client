"use client";

import Link from "next/link";
import { useState } from "react";
import type { ReactNode } from "react";
import { SidebarMobile } from "@/widgets/sidebar-mobile";

/**
 * TODO: 아래 에셋은 7일 후 만료되는 Figma 임시 URL입니다.
 * logo(icon+wordmark), ic_arrow(28), ic_menu(24)를 SVG로 export해
 * public/icons 또는 public/figma에 커밋한 뒤 교체하세요.
 */
const FIGMA_TEMP_BACK_ARROW = "https://www.figma.com/api/mcp/asset/182d15c2-b495-477d-a117-2854940ad283";
/** 아이콘과 워드마크가 합쳐진 113×20 로고 */
const LOGO = "/images/logo.svg";
const FIGMA_TEMP_MENU = "https://www.figma.com/api/mcp/asset/db6273c5-1d64-4523-ac94-7e5d57044100";

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
      className="absolute left-0 top-0 flex items-center p-2.5"
    >
      <span className="flex size-7 items-center justify-center">
        {backIcon ?? (
          // eslint-disable-next-line @next/next/no-img-element -- 임시 Figma 에셋, 커밋된 SVG로 교체 예정
          <img alt="" src={FIGMA_TEMP_BACK_ARROW} className="block h-3.5 w-[7px] max-w-none" />
        )}
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
          className={[
            "flex w-full items-center justify-between border-b border-grayscale-100 bg-white px-5 py-2",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
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
              {props.menuIcon ?? (
                // eslint-disable-next-line @next/next/no-img-element -- 임시 Figma 에셋, 커밋된 SVG로 교체 예정
                <img alt="" src={FIGMA_TEMP_MENU} className="block size-full max-w-none" />
              )}
            </span>
          </button>
        </header>
        {!onMenuClick && <SidebarMobile open={menuOpen} onClose={() => setMenuOpen(false)} />}
      </>
    );
  }

  return (
    <header
      className={["relative h-[52px] w-full overflow-clip bg-white", className]
        .filter(Boolean)
        .join(" ")}
    >
      <BackButton onBack={props.onBack} backIcon={props.backIcon} />
      {props.variant === "title" && (
        <p className="absolute left-[38px] top-1/2 -translate-y-1/2 whitespace-nowrap text-lg font-semibold leading-[1.4] tracking-[-0.18px] text-grayscale-900">
          {props.title}
        </p>
      )}
    </header>
  );
}

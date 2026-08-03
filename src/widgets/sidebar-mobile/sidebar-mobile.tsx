"use client";

import Link from "next/link";
import { useState } from "react";

import { ROUTES } from "@/shared/config";
import { cn } from "@/shared/lib/cn";

/**
 * TODO: 닫기(X)·화살표 아이콘은 7일 후 만료되는 Figma 임시 URL입니다.
 * export해 public/icons 또는 public/figma에 커밋한 뒤 교체하세요.
 */
const FIGMA_TEMP_IC_CLOSE = "/figma/ic-close-2aee5b2b.svg";
const FIGMA_TEMP_IC_ARROW_DOWN = "/figma/ic-arrow-down-2f96af07.svg";
const FIGMA_TEMP_IC_CHEVRON = "/figma/ic-chevron-4aebc6c0.svg";

/* eslint-disable @next/next/no-img-element -- 임시 Figma 에셋, 커밋된 SVG로 교체 예정 */

interface MenuGroup {
  key: string;
  label: string;
  href?: string;
  items?: { label: string; href: string }[];
}

const MENU: MenuGroup[] = [
  { key: "intro", label: "서비스 소개", href: ROUTES.intro },
  {
    key: "listing",
    label: "방 내놓기",
    items: [
      { label: "매물 등록", href: ROUTES.listing.start },
      { label: "내 방 관리", href: ROUTES.listing.manage },
    ],
  },
  {
    key: "finding",
    label: "방 찾기",
    items: [
      { label: "매물 보기", href: ROUTES.rooms },
      { label: "예약 관리", href: ROUTES.reservations },
      { label: "관심 목록", href: ROUTES.favorites },
    ],
  },
  // TODO: 마이페이지 하위 메뉴가 정해지면 items를 채우세요.
  { key: "mypage", label: "마이페이지", items: [] },
];

export interface SidebarMobileProps {
  open: boolean;
  onClose: () => void;
  /** 로그인 사용자 이름 */
  userName?: string;
  /** 회원 유형 라벨 (예: 호스트 회원) */
  userRole?: string;
  onLogout?: () => void;
}

/**
 * 모바일 사이드 메뉴 (Figma: sidebar_mobile, node 541:21240)
 *
 * - 전체 화면 흰 배경 드로어, 우상단 닫기
 * - 그룹 메뉴는 아코디언(기본: 방 내놓기 펼침)
 */
export function SidebarMobile({
  open,
  onClose,
  userName = "홍길동",
  userRole = "호스트 회원",
  onLogout,
}: SidebarMobileProps) {
  const [expanded, setExpanded] = useState<string | null>("listing");

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-white pt-11 md:hidden"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex w-full items-start justify-end pt-3 pr-3 pb-4 pl-6">
        <button
          type="button"
          aria-label="메뉴 닫기"
          onClick={onClose}
          className="flex size-12 items-center justify-center"
        >
          <span className="flex size-6 items-center justify-center">
            <img alt="" src={FIGMA_TEMP_IC_CLOSE} className="block size-full max-w-none" />
          </span>
        </button>
      </div>

      <div className="flex w-full flex-1 flex-col gap-5 overflow-y-auto px-4">
        <div className="flex w-full flex-col gap-1">
          <Link href={ROUTES.myPage} className="flex items-start gap-1">
            <span className="text-xl leading-[1.4] font-semibold tracking-[-0.2px] whitespace-nowrap text-grayscale-800">
              {userName}님
            </span>
            <span className="flex size-[18px] items-center justify-center p-1" aria-hidden="true">
              <img
                alt=""
                src={FIGMA_TEMP_IC_CHEVRON}
                className="block h-[9px] w-[4.5px] max-w-none rotate-180"
              />
            </span>
          </Link>
          <p className="py-1.5 text-sm leading-[1.4] font-medium text-grayscale-500">{userRole}</p>
        </div>

        <nav className="flex w-full flex-col gap-2">
          {MENU.map((group) => (
            <div
              key={group.key}
              className="flex w-full flex-col gap-1 border-t border-grayscale-100 pt-2 first:border-t-0 first:pt-0"
            >
              {group.href ? (
                <Link
                  href={group.href}
                  onClick={onClose}
                  className="flex w-full items-center px-2 py-3 text-lg leading-[1.4] font-medium tracking-[-0.18px] text-grayscale-800"
                >
                  {group.label}
                </Link>
              ) : (
                <button
                  type="button"
                  aria-expanded={expanded === group.key}
                  onClick={() => setExpanded((prev) => (prev === group.key ? null : group.key))}
                  className="flex w-full items-center justify-between px-2 py-3 text-left text-lg leading-[1.4] font-medium tracking-[-0.18px] text-grayscale-800"
                >
                  {group.label}
                  <span
                    className={cn(
                      "flex size-6 items-center justify-center transition-transform",
                      expanded === group.key ? "rotate-180" : "",
                    )}
                    aria-hidden="true"
                  >
                    <img
                      alt=""
                      src={FIGMA_TEMP_IC_ARROW_DOWN}
                      className="block h-[5.4px] w-[10.8px] max-w-none"
                    />
                  </span>
                </button>
              )}
              {group.items && expanded === group.key && (
                <div className="flex flex-col">
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className="flex w-full items-center px-2 py-3 text-base leading-[1.5] font-medium text-grayscale-600"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="border-t border-grayscale-100 pt-2">
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center px-2 py-3 text-left text-lg leading-[1.4] font-medium tracking-[-0.18px] text-system-error"
            >
              로그아웃
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}

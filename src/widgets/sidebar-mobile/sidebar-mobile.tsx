"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";

import { logout, MEMBER_ROLE_LABELS, userQueryKeys, useSession } from "@/domains/user";
import { ROUTES } from "@/shared/config";
import { cn } from "@/shared/lib/cn";
import { Divider } from "@/shared/ui/divider";

/* eslint-disable @next/next/no-img-element -- next/image는 dangerouslyAllowSVG 없이 SVG를 막습니다 */

const IC_CLOSE = "/icons/ic-x-cancel.svg";
const IC_ARROW_DOWN = "/icons/ic_nav_arrow.svg";
const IC_CHEVRON = "/figma/ic-chevron-4aebc6c0.svg";

interface MenuGroup {
  key: string;
  label: string;
  /** 하위 메뉴가 없는 단일 링크 */
  href?: string;
  items?: { label: string; href: string }[];
}

const MENU: MenuGroup[] = [
  { key: "intro", label: "서비스 소개", href: ROUTES.intro.root },
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
  {
    key: "mypage",
    label: "마이페이지",
    items: [
      { label: "마이페이지로 가기", href: ROUTES.myPage },
      { label: "계정 정보", href: ROUTES.accountInfo },
      { label: "알림 설정", href: ROUTES.notificationSettings },
    ],
  },
];

/** Figma card_list_mobile — 최상위 행 (px-8 py-12 · 18px Medium) */
const ROW = "flex w-full items-center px-2 py-3 text-headline-1 font-medium text-grayscale-800";

export interface SidebarMobileProps {
  open: boolean;
  onClose: () => void;
}

/**
 * 모바일 사이드 메뉴 (Figma: 비로그인 1504:41914 · 로그인 1504:41931 · 펼침 1504:41953)
 *
 * 전체 화면 흰 배경 드로어입니다. 메뉴 행 사이마다 구분선이 들어가고, 하위 메뉴가
 * 있는 항목은 아코디언으로 열립니다(기본은 모두 접힘).
 *
 * 로그인 여부는 화면이 내려주는 값이 아니라 세션에서 직접 읽습니다. 사이드바는
 * 모든 화면에 공통으로 붙어서, 화면마다 상태를 전달하면 어긋나기 쉽습니다.
 */
export function SidebarMobile({ open, onClose }: SidebarMobileProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, session } = useSession();
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  if (!open) return null;

  const handleLogout = async () => {
    await logout();
    await queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
    onClose();
    router.push(ROUTES.home);
  };

  const memberRole = session.user?.memberRole;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-white pt-11 md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="메뉴"
    >
      <div className="flex w-full items-start justify-end pt-3 pr-3 pb-4 pl-6">
        <button
          type="button"
          aria-label="메뉴 닫기"
          onClick={onClose}
          className="flex items-center justify-center p-2 transition-opacity hover:opacity-70"
        >
          <span className="flex size-6 items-center justify-center">
            <img alt="" src={IC_CLOSE} className="block size-full max-w-none" />
          </span>
        </button>
      </div>

      <div className="flex w-full flex-1 flex-col gap-5 overflow-y-auto px-4">
        <div className="flex w-full flex-col gap-1">
          {isAuthenticated ? (
            <>
              <Link href={ROUTES.myPage} onClick={onClose} className="flex items-start gap-1">
                <span className="text-heading-2 font-semibold whitespace-nowrap text-grayscale-800">
                  {session.user?.name ? `${session.user.name}님` : "마이페이지"}
                </span>
                <span className="flex items-center p-1" aria-hidden="true">
                  {/* 아래를 향한 셰브론을 반시계로 90도 돌려 오른쪽을 보게 합니다. */}
                  <img
                    alt=""
                    src={IC_CHEVRON}
                    className="block h-[4.5px] w-[9px] max-w-none -rotate-90"
                  />
                </span>
              </Link>
              {memberRole && (
                <p className="py-1.5 text-label-1 font-medium text-grayscale-500">
                  {MEMBER_ROLE_LABELS[memberRole]}
                </p>
              )}
            </>
          ) : (
            <>
              <Link
                href={ROUTES.auth.login}
                onClick={onClose}
                className="text-heading-2 font-semibold whitespace-nowrap text-grayscale-800"
              >
                로그인해주세요
              </Link>
              <Link
                href={ROUTES.auth.login}
                onClick={onClose}
                className="py-1.5 text-label-1 font-medium text-grayscale-500"
              >
                로그인 또는 회원가입
              </Link>
            </>
          )}
        </div>

        <nav className="flex w-full flex-col gap-2 pb-6">
          {MENU.map((group) => {
            const expanded = expandedKey === group.key;

            return (
              <Fragment key={group.key}>
                {group.href ? (
                  <Link href={group.href} onClick={onClose} className={ROW}>
                    {group.label}
                  </Link>
                ) : (
                  <div className="flex w-full flex-col gap-1">
                    <button
                      type="button"
                      aria-expanded={expanded}
                      onClick={() => setExpandedKey(expanded ? null : group.key)}
                      className={cn(ROW, "justify-between text-left")}
                    >
                      {group.label}
                      <span
                        className={cn(
                          "flex size-6 items-center justify-center transition-transform",
                          expanded && "rotate-180",
                        )}
                        aria-hidden="true"
                      >
                        <img alt="" src={IC_ARROW_DOWN} className="block size-5 max-w-none" />
                      </span>
                    </button>
                    {expanded && (
                      <div className="flex w-full flex-col">
                        {group.items?.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className="flex w-full items-center px-2 py-3 text-body-1 font-medium text-grayscale-600"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <Divider />
              </Fragment>
            );
          })}

          {isAuthenticated && (
            <button
              type="button"
              onClick={() => {
                void handleLogout();
              }}
              className={cn(ROW, "text-left text-system-error")}
            >
              로그아웃
            </button>
          )}
        </nav>
      </div>
    </div>
  );
}

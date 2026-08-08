"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { useSession } from "@/domains/user";
import { ROUTES } from "@/shared/config";
import { cn } from "@/shared/lib/cn";
import { BtnCta } from "@/shared/ui/btn-cta";
import { BtnText } from "@/shared/ui/btn-text";
import { Icon } from "@/shared/ui/icons";

/** 아이콘과 워드마크가 합쳐진 113×20 로고 */
const LOGO = "/images/logos/logo-s.svg";
const IC_ARROW_DOWN = "/icons/ic_nav_arrow.svg";

interface SubMenuItem {
  label: string;
  href: string;
}

const MENU = {
  intro: { label: "서비스 소개", href: ROUTES.intro.root },
  listing: {
    label: "방 내놓기",
    items: [
      { label: "매물 등록", href: ROUTES.listing.start },
      { label: "내 방 관리", href: ROUTES.listing.manage },
    ] satisfies SubMenuItem[],
  },
  finding: {
    label: "방 찾기",
    items: [
      { label: "매물 보기", href: ROUTES.rooms },
      { label: "예약 관리", href: ROUTES.reservations },
      { label: "관심 목록", href: ROUTES.favorites },
    ] satisfies SubMenuItem[],
  },
  support: { label: "고객센터", href: ROUTES.support },
} as const;

type MenuKey = "intro" | "listing" | "finding" | "support";

/**
 * 현재 경로가 속한 메뉴
 *
 * 활성 메뉴를 페이지가 내려주면 새 화면을 추가할 때마다 빠뜨리기 쉬워, 경로에서
 * 직접 판단합니다. 하위 화면(예: 매물 등록 3단계)도 상위 메뉴가 활성화됩니다.
 */
function toActiveMenu(pathname: string): MenuKey | null {
  const startsWith = (prefix: string) => pathname === prefix || pathname.startsWith(`${prefix}/`);

  if (pathname === ROUTES.home || startsWith("/intro")) {
    return "intro";
  }
  if (startsWith("/listing")) return "listing";
  if ([ROUTES.rooms, ROUTES.reservations, ROUTES.favorites].some(startsWith)) return "finding";
  if (startsWith(ROUTES.support)) return "support";

  return null;
}

function ArrowIcon({ open }: { open: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-4.5 w-[13.4px] flex-col items-center justify-center transition-transform",
        open ? "rotate-180" : "",
      )}
      aria-hidden="true"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- next/image는 dangerouslyAllowSVG 없이 SVG를 막습니다 */}
      <img alt="" src={IC_ARROW_DOWN} className="block max-w-none" />
    </span>
  );
}

function SubMenu({ items }: { items: readonly SubMenuItem[] }) {
  return (
    <div className="absolute top-[calc(100%+16px)] left-0 z-20 flex w-max flex-col">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="p-2.5 text-sm leading-5 font-medium text-grayscale-700 hover:font-semibold hover:text-grayscale-800"
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

/**
 * GNB 내비게이션 (Figma: navigation, node 155:2328)
 *
 * - closed: h-52 흰 배경 바
 * - opened: 드롭다운 트리거 hover 시 하단 154px 메가메뉴 패널 (border-b grayscale-100)
 * - state=default(1504:40401): 로그인/회원가입(BtnCta stroke xs)
 * - state=login(1504:40490): 구분선 + 프로필 → 마이페이지
 *
 * 로그인 여부는 페이지가 내려주는 값이 아니라 실제 세션에서 읽습니다. 헤더는 모든
 * 화면에 공통으로 붙어서, 화면마다 상태를 전달하면 어긋나기 쉽습니다.
 */
export function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, session } = useSession();
  const [openMenu, setOpenMenu] = useState<"listing" | "finding" | null>(null);
  const open = openMenu !== null;
  const activeItem = toActiveMenu(pathname);

  return (
    <header className="relative w-full bg-white" onMouseLeave={() => setOpenMenu(null)}>
      <div className="flex h-[52px] items-center justify-center border-b border-grayscale-100 px-[200px]">
        <div className="flex min-w-0 flex-1 items-center justify-between px-5 py-1">
          <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center py-2" aria-label="Home Together">
              {/* eslint-disable-next-line @next/next/no-img-element -- next/image는 dangerouslyAllowSVG 없이 SVG를 막습니다 */}
              <img src={LOGO} alt="Home Together" width={113} height={20} className="block" />
            </Link>
            <nav className="flex items-center gap-8">
              <div className="p-2.5">
                <Link
                  href={MENU.intro.href}
                  className={cn(
                    "text-sm leading-5",
                    activeItem === "intro"
                      ? "font-bold text-primary-500"
                      : "font-medium text-grayscale-700 hover:font-semibold hover:text-grayscale-800",
                  )}
                >
                  {MENU.intro.label}
                </Link>
              </div>
              <div className="relative p-2.5" onMouseEnter={() => setOpenMenu("listing")}>
                <BtnText
                  size="14"
                  selected={activeItem === "listing"}
                  rightIcon={<ArrowIcon open={openMenu === "listing"} />}
                  aria-expanded={openMenu === "listing"}
                >
                  {MENU.listing.label}
                </BtnText>
                {openMenu === "listing" && <SubMenu items={MENU.listing.items} />}
              </div>
              <div className="relative p-2.5" onMouseEnter={() => setOpenMenu("finding")}>
                <BtnText
                  size="14"
                  selected={activeItem === "finding"}
                  rightIcon={<ArrowIcon open={openMenu === "finding"} />}
                  aria-expanded={openMenu === "finding"}
                >
                  {MENU.finding.label}
                </BtnText>
                {openMenu === "finding" && <SubMenu items={MENU.finding.items} />}
              </div>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-2.5">
              <Link
                href={MENU.support.href}
                className={cn(
                  "text-sm leading-5",
                  activeItem === "support"
                    ? "font-bold text-primary-500"
                    : "font-medium text-grayscale-700 hover:font-semibold hover:text-grayscale-800",
                )}
              >
                {MENU.support.label}
              </Link>
            </div>
            {/*
              `isAuthenticated`는 조회 전에는 서버가 내려준 쿠키 힌트를 쓰므로 첫 HTML부터
              맞는 쪽이 그려집니다. 높이를 고정해 조회 결과로 바뀔 때 세로 정렬이
              흔들리지 않게 합니다.
            */}
            <div className="flex h-8 items-center gap-4">
              {isAuthenticated ? (
                <>
                  <span className="h-4 w-px bg-grayscale-200" aria-hidden="true" />
                  <Link
                    href={ROUTES.myPage}
                    className="flex items-center px-3 py-1.5"
                    aria-label={
                      session.user?.name ? `${session.user.name}님 마이페이지` : "마이페이지"
                    }
                  >
                    <span className="flex size-8 items-center justify-center overflow-hidden rounded-full bg-grayscale-100 text-grayscale-400">
                      <Icon name="account_circle" size={32} filled />
                    </span>
                  </Link>
                </>
              ) : (
                <BtnCta variant="stroke" size="xs" onClick={() => router.push(ROUTES.auth.login)}>
                  로그인/회원가입
                </BtnCta>
              )}
            </div>
          </div>
        </div>
      </div>
      {open && (
        <div
          className="absolute top-full left-0 z-10 h-[154px] w-full border-b border-grayscale-100 bg-white"
          aria-hidden="true"
        />
      )}
    </header>
  );
}

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { ROUTES } from "@/shared/config";
import { ResponsiveHeader } from "@/widgets/responsive-header";

export function ListingManagementShell({
  children,
  editing = false,
  listHref = ROUTES.listing.manage,
}: {
  children: ReactNode;
  editing?: boolean;
  listHref?: string;
}) {
  return (
    <div className="min-h-screen bg-grayscale-50">
      <ResponsiveHeader
        mobile={{ variant: "title", title: editing ? "매물 수정" : "내 방 관리", showMenu: true }}
      />
      <main className="mx-auto flex w-full max-w-[1232px] flex-col px-4 pt-6 pb-24 md:pt-12 md:pb-[180px]">
        <nav
          aria-label="브레드크럼"
          className={`${editing ? "mb-8" : "mb-11"} flex min-h-[14px] flex-wrap items-center gap-1 pl-[14px] text-sm leading-[14px] font-semibold text-grayscale-500 md:text-base`}
        >
          <Link href={ROUTES.myPage}>마이페이지</Link>
          <Image src="/images/listing-management/chevron.svg" width={14} height={14} alt="" />
          <Link href={listHref} aria-current={editing ? undefined : "page"}>
            내 방 관리
          </Link>
          {editing && (
            <>
              <Image src="/images/listing-management/chevron.svg" width={14} height={14} alt="" />
              <span aria-current="page">매물 수정</span>
            </>
          )}
        </nav>
        {children}
      </main>
    </div>
  );
}

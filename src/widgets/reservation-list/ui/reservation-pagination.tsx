import Link from "next/link";

import type { ReservationTab } from "@/domains/reservation";
import { ROUTES } from "@/shared/config";
import { cn } from "@/shared/lib/cn";
import { Icon } from "@/shared/ui/icons";

export interface ReservationPaginationProps {
  activeTab: ReservationTab;
  currentPage: number;
  totalPages: number;
}

function getPageHref(tab: ReservationTab, page: number): string {
  const params = new URLSearchParams();
  if (tab !== "all") params.set("status", tab);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${ROUTES.reservations}?${query}` : ROUTES.reservations;
}

interface PaginationArrowProps {
  direction: "previous" | "next";
  disabled: boolean;
  href: string;
}

function PaginationArrow({ direction, disabled, href }: PaginationArrowProps) {
  const label = direction === "previous" ? "이전 페이지" : "다음 페이지";
  const iconName = direction === "previous" ? "chevron_left" : "chevron_right";

  if (disabled) {
    return (
      <span
        aria-disabled="true"
        aria-label={label}
        className="flex size-10 items-center justify-center rounded-lg text-grayscale-300"
      >
        <Icon name={iconName} size={22} />
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      className="flex size-10 items-center justify-center rounded-lg text-grayscale-600 outline-none transition-colors hover:bg-grayscale-70 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
    >
      <Icon name={iconName} size={22} />
    </Link>
  );
}

export function ReservationPagination({
  activeTab,
  currentPage,
  totalPages,
}: ReservationPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="예약 목록 페이지">
      <PaginationArrow
        direction="previous"
        disabled={currentPage === 1}
        href={getPageHref(activeTab, currentPage - 1)}
      />
      {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => {
        const active = page === currentPage;

        return (
          <Link
            key={page}
            href={getPageHref(activeTab, page)}
            aria-label={`${page}페이지`}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex size-10 items-center justify-center rounded-lg text-label-1 font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
              active
                ? "bg-primary-500 text-white"
                : "text-grayscale-600 hover:bg-grayscale-70",
            )}
          >
            {page}
          </Link>
        );
      })}
      <PaginationArrow
        direction="next"
        disabled={currentPage === totalPages}
        href={getPageHref(activeTab, currentPage + 1)}
      />
    </nav>
  );
}

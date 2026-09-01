import Link from "next/link";

import type { ReservationTab } from "@/domains/reservation";
import { ROUTES } from "@/shared/config";
import { cn } from "@/shared/lib/cn";

export interface ReservationTabItem {
  value: ReservationTab;
  label: string;
  count: number;
}

export interface ReservationTabsProps {
  activeTab: ReservationTab;
  items: ReservationTabItem[];
}

function getTabHref(tab: ReservationTab): string {
  return tab === "all" ? ROUTES.reservations : `${ROUTES.reservations}?status=${tab}`;
}

export function ReservationTabs({ activeTab, items }: ReservationTabsProps) {
  return (
    <div
      className="-mx-4 [scrollbar-width:none] overflow-x-auto px-4 md:mx-0 md:px-0"
      role="tablist"
      aria-label="예약 상태"
    >
      <div className="flex min-w-max gap-2 border-b border-grayscale-200">
        {items.map((item) => {
          const active = activeTab === item.value;

          return (
            <Link
              key={item.value}
              href={getTabHref(item.value)}
              role="tab"
              aria-selected={active}
              aria-controls="reservation-list-panel"
              className={cn(
                "relative flex h-12 items-center gap-1.5 px-3 text-body-2 font-semibold whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
                active ? "text-primary-600" : "text-grayscale-500 hover:text-grayscale-800",
              )}
            >
              {item.label}
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-caption-1",
                  active
                    ? "bg-primary-100 text-primary-600"
                    : "bg-grayscale-100 text-grayscale-500",
                )}
              >
                {item.count}
              </span>
              {active && (
                <span className="absolute right-0 bottom-[-1px] left-0 h-0.5 bg-primary-500" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

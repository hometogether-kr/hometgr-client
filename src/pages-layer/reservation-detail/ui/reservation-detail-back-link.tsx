import Link from "next/link";

import { Icon } from "@/shared/ui/icons";

export interface ReservationDetailBackLinkProps {
  href: string;
  /** 페이지 제목 (h1) — Figma "예약 상세 정보" / "방문 후기 작성" */
  label: string;
  /** 뒤로가기 링크의 접근성 라벨 */
  ariaLabel: string;
}

export function ReservationDetailBackLink({
  href,
  label,
  ariaLabel,
}: ReservationDetailBackLinkProps) {
  return (
    <div className="flex items-center gap-3">
      <Link
        href={href}
        aria-label={ariaLabel}
        className="flex size-11 shrink-0 items-center justify-center rounded-full text-grayscale-900 transition-colors outline-none hover:bg-grayscale-100 focus-visible:ring-2 focus-visible:ring-primary-500 md:size-[52px]"
      >
        <Icon name="arrow_back_ios_new" size={32} />
      </Link>
      <h1 className="text-[28px] leading-[1.3] font-semibold tracking-[-0.02em] text-grayscale-900 md:text-[40px]">
        {label}
      </h1>
    </div>
  );
}

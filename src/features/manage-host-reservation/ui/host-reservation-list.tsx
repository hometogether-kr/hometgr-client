import Link from "next/link";

import { formatHostVisitTime, type HostReservation } from "@/domains/reservation";
import { ROUTES } from "@/shared/config";
import { cn } from "@/shared/lib/cn";

import { StudentAvatar } from "./host-reservation-parts";

export function HostReservationList({
  reservations,
  tab,
  page,
}: {
  reservations: HostReservation[];
  tab: string;
  page: number;
}) {
  const pending = reservations.filter((item) => ["pending", "suggested"].includes(item.status));
  const confirmed = reservations.filter((item) => item.status === "confirmed");
  const past = reservations.filter((item) => ["rejected", "cancelled"].includes(item.status));
  const items =
    tab === "pending"
      ? pending
      : tab === "confirmed"
        ? confirmed
        : tab === "past"
          ? past
          : reservations;
  const totalPages = Math.max(1, Math.ceil(items.length / 3));
  const currentPage = Math.min(page, totalPages);
  const visibleItems = items.slice((currentPage - 1) * 3, currentPage * 3);
  const tabs = [
    { value: "all", label: "전체" },
    { value: "pending", label: `대기 중(${pending.length})` },
    { value: "confirmed", label: `예약 확정(${confirmed.length})` },
    { value: "past", label: "지난 예약" },
  ];
  return (
    <div className="py-10 md:py-20">
      <h1 className="mb-6 text-[36px] leading-[1.3] font-semibold text-grayscale-900">예약 관리</h1>
      <nav
        aria-label="예약 상태"
        className="mb-6 flex gap-8 overflow-x-auto border-b border-grayscale-200"
      >
        {tabs.map((item) => (
          <Link
            key={item.value}
            href={`${ROUTES.hostReservations}?tab=${item.value}`}
            aria-current={tab === item.value ? "page" : undefined}
            className={cn(
              "shrink-0 border-b-2 pb-3 text-body-1",
              tab === item.value
                ? "border-primary-500 font-semibold text-primary-500"
                : "border-transparent text-grayscale-700",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="flex flex-col gap-6">
        {visibleItems.map((item) => (
          <article
            key={item.id}
            className="flex flex-wrap items-center gap-6 rounded-[20px] bg-white p-7"
          >
            <StudentAvatar />
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-semibold">{item.studentName} 님</h2>
              <p className="mt-2 text-label-1 text-grayscale-500">
                {item.status === "confirmed"
                  ? `예약 확정 · ${formatHostVisitTime(item.scheduledTime)}`
                  : item.status === "suggested"
                    ? `일정 재선택 대기 · ${item.suggestion}`
                    : item.status === "rejected"
                      ? `거절 · ${item.reason}`
                      : item.status === "cancelled"
                        ? "예약 취소"
                        : "방문 신청 │ 2026년 9월 25일 14:00 · 2026년 9월 27일 12:00"}
              </p>
              <p className="mt-4 text-label-1 text-grayscale-700">
                자기소개: &quot;{item.introduction}&quot;
              </p>
            </div>
            <Link
              href={`${ROUTES.hostReservations}?id=${item.id}&view=${item.status === "confirmed" ? "confirmed" : ["rejected", "cancelled"].includes(item.status) ? "closed" : "select"}`}
              className="rounded-lg bg-primary-500 px-4 py-2 text-label-2 font-semibold text-white hover:bg-primary-600"
            >
              상세 보기
            </Link>
          </article>
        ))}
        {!items.length && (
          <p className="py-24 text-center text-grayscale-500">해당하는 예약이 없어요.</p>
        )}
      </div>
      <nav
        aria-label="예약 목록 페이지"
        className="mt-20 flex items-center justify-center gap-6 md:mt-[166px]"
      >
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
          <Link
            key={number}
            href={`${ROUTES.hostReservations}?tab=${tab}&page=${number}`}
            aria-current={number === currentPage ? "page" : undefined}
            className={cn(
              "px-2 text-label-1",
              number === currentPage ? "font-bold text-primary-500" : "text-grayscale-500",
            )}
          >
            {number}
          </Link>
        ))}
      </nav>
    </div>
  );
}

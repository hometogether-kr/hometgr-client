import { formatHostVisitTime, type HostReservation } from "@/domains/reservation";

import { HostPanel, StudentAvatar } from "./host-reservation-parts";

/* eslint-disable @next/next/no-img-element -- Local original Figma assets. */
export function HostReservationSummary({
  reservation,
  compact = false,
}: {
  reservation: HostReservation;
  compact?: boolean;
}) {
  const schedule = (
    <span className="flex items-center gap-3">
      <img src="/figma/host-reservation-calendar.svg" alt="" className="size-6" />
      {formatHostVisitTime(reservation.scheduledTime)}
    </span>
  );
  if (compact)
    return (
      <HostPanel className="mx-auto w-full max-w-[500px]">
        <dl className="space-y-6">
          <div className="border-b border-grayscale-300 pb-6">
            <dt className="mb-2 text-label-1 text-grayscale-500">예약 번호</dt>
            <dd className="text-xl">{reservation.id.toUpperCase()}</dd>
          </div>
          <div>
            <dt className="mb-2 text-label-1 text-grayscale-500">변경 날짜 / 시간</dt>
            <dd>{schedule}</dd>
          </div>
          <div>
            <dt className="mb-2 text-label-1 text-grayscale-500">장소</dt>
            <dd>서울특별시 마포구 연남동</dd>
          </div>
        </dl>
      </HostPanel>
    );
  return (
    <HostPanel>
      <h2 className="mb-6 text-2xl font-semibold">예약 요약</h2>
      <div className="flex items-center gap-6 border-b border-grayscale-200 pb-8">
        <img
          src="/figma/host-reservation-room.png"
          alt="마포구 연남동 신축 투룸"
          className="h-[132px] w-[180px] rounded-lg object-cover max-sm:h-24 max-sm:w-28"
        />
        <div>
          <p className="text-xl text-grayscale-700">월세 1,000/80</p>
          <h3 className="mt-3 text-2xl font-semibold">마포구 연남동 신축 투룸</h3>
          <p className="mt-6 text-body-1 text-grayscale-500">서울특별시 마포구 연남동</p>
        </div>
      </div>
      <div className="grid gap-6 border-b border-grayscale-200 py-8 md:grid-cols-2">
        <div>
          <p className="mb-3 text-label-1 text-grayscale-500">방문 예정 학생</p>
          <div className="flex items-center gap-2 text-2xl font-semibold">
            <StudentAvatar small />
            {reservation.studentName} 님
          </div>
        </div>
        <div>
          <p className="mb-3 text-label-1 text-grayscale-500">확정된 방문 일정</p>
          <div className="text-xl font-semibold">{schedule}</div>
        </div>
      </div>
      <p className="mt-8 mb-3 text-label-1 text-grayscale-500">방문 목적 및 요청 사항</p>
      <p className="rounded-lg bg-grayscale-70 p-6 text-lg">
        안녕하세요! 이번 방문을 통해 어르신과 함께 가벼운 산책을 하고, 스마트폰 사용법을 알려드리고
        싶습니다.
      </p>
    </HostPanel>
  );
}

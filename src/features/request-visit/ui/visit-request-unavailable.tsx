import Link from "next/link";

import type { VisitRequestContext } from "@/domains/reservation";
import { ROUTES } from "@/shared/config";

interface VisitRequestUnavailableProps {
  context: VisitRequestContext;
  roomId: string;
}

export function VisitRequestUnavailable({ context, roomId }: VisitRequestUnavailableProps) {
  const returnQuery = new URLSearchParams({ returnTo: ROUTES.newRoomReservation(roomId) });

  switch (context.blockedReason) {
    case "LOGIN_REQUIRED":
      return (
        <VisitRequestNotice
          message="방문 예약을 신청하려면 로그인해 주세요."
          href={`${ROUTES.auth.login}?${returnQuery}`}
          linkLabel="로그인"
        />
      );
    case "ONBOARDING_REQUIRED":
      return (
        <VisitRequestNotice
          message="방문 예약을 신청하려면 가입을 완료해 주세요."
          href={`${ROUTES.auth.terms}?${returnQuery}`}
          linkLabel="가입 계속하기"
        />
      );
    case "DUPLICATE_ACTIVE_RESERVATION":
      return (
        <VisitRequestNotice
          message="이 매물에 진행 중인 방문 예약이 있어요."
          href={
            context.blockingReservationId
              ? ROUTES.reservationDetail(context.blockingReservationId)
              : ROUTES.reservations
          }
          linkLabel="예약 내역 보기"
        />
      );
    case "ROLE_NOT_ALLOWED":
      return <VisitRequestNotice message="학생 계정으로 방문 예약을 신청할 수 있어요." />;
    default:
      return <VisitRequestNotice message="현재 이 매물은 방문 예약을 신청할 수 없어요." />;
  }
}

interface VisitRequestNoticeProps {
  message: string;
  href?: string;
  linkLabel?: string;
}

function VisitRequestNotice({ message, href, linkLabel }: VisitRequestNoticeProps) {
  return (
    <section className="space-y-4 rounded-[20px] bg-white p-5 md:p-10">
      <p role="status" className="text-body-1 text-grayscale-700">
        {message}
      </p>
      {href && (
        <Link href={href} className="text-label-1 font-semibold text-primary-600 underline">
          {linkLabel}
        </Link>
      )}
    </section>
  );
}

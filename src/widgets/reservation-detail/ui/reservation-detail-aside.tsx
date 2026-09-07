import Link from "next/link";

import {
  getReservationDetailPresentation,
  type ReservationDetailViewModel,
} from "@/domains/reservation";
import { CancelReservationButton } from "@/features/manage-reservation";
import { ROUTES } from "@/shared/config";
import { BtnCta } from "@/shared/ui/btn-cta";

export interface ReservationDetailAsideProps {
  reservation: ReservationDetailViewModel;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-headline-1 font-medium text-grayscale-500">{label}</dt>
      <dd className="text-heading-2 font-medium text-grayscale-800">{value}</dd>
    </div>
  );
}

/**
 * 예약 상세 우측 패널 (Figma 5.1.1~5.1.4)
 *
 * - 대기/확정: 방문 예약 정보 + [예약 변경 · 예약 취소]
 * - 방문 완료: 방문 예약 정보 + [후기 작성하기 · 다른 매물 찾기]
 * - 취소/거절: 안내 카드 + [다른 매물 찾아보기]
 */
export function ReservationDetailAside({ reservation }: ReservationDetailAsideProps) {
  const { tone, scheduleLabel } = getReservationDetailPresentation(reservation);

  if (tone === "closed") {
    return (
      <aside className="rounded-[20px] border-[1.4px] border-grayscale-200 bg-white px-9 py-9">
        <h2 className="text-title-3 font-semibold text-grayscale-800">
          예약이 취소/거절된 매물이에요
        </h2>
        <Link href={ROUTES.rooms} className="mt-12 block">
          <BtnCta size="xl" className="w-full">
            다른 매물 찾아보기
          </BtnCta>
        </Link>
      </aside>
    );
  }

  return (
    <aside className="flex flex-col gap-6">
      <h2 className="text-title-3 font-semibold text-grayscale-900">방문 예약 정보</h2>
      <dl className="flex flex-col gap-3 px-0.5">
        <InfoRow label="예약 번호" value={reservation.reservationNumber} />
        <InfoRow label="일정" value={scheduleLabel} />
        <InfoRow label="방문 인원" value={reservation.visitorCountLabel} />
      </dl>
      <div className="flex gap-3">
        {tone === "visited" ? (
          <>
            <Link href={ROUTES.rooms} className="flex-1">
              <BtnCta variant="sub" size="xl" className="w-full">
                다른 매물 찾기
              </BtnCta>
            </Link>
            <Link href={ROUTES.reservationReview(reservation.id)} className="flex-1">
              <BtnCta variant="emphasize" size="xl" className="w-full">
                후기 작성하기
              </BtnCta>
            </Link>
          </>
        ) : (
          <>
            <Link href={ROUTES.newRoomReservation(reservation.roomId)} className="flex-1">
              <BtnCta variant="sub" size="xl" className="w-full">
                예약 변경
              </BtnCta>
            </Link>
            <CancelReservationButton className="flex-1" />
          </>
        )}
      </div>
    </aside>
  );
}

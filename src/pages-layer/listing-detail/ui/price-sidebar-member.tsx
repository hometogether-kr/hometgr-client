import { formatManwon, type RoomPrice } from "@/domains/listing";
import { BtnCta } from "@/shared/ui/btn-cta";

export interface PriceSidebarMemberProps {
  price: RoomPrice;
  canRequestVisit: boolean;
  canRequestContract: boolean;
  isRequestingContract: boolean;
  onRequestContract: () => void;
  onRequestVisit: () => void;
  onViewReservation: () => void;
}

/**
 * 가격/예약 사이드바 — 회원 (Figma: node 1222:46291)
 *
 * 방문 완료 예약이 있으면 계약 의사를 서버에 전달하고, 활성 예약이 있으면
 * 중복 방문 신청 대신 해당 예약 상세로 이동합니다.
 */
export function PriceSidebarMember({
  price,
  canRequestVisit,
  canRequestContract,
  isRequestingContract,
  onRequestContract,
  onRequestVisit,
  onViewReservation,
}: PriceSidebarMemberProps) {
  return (
    <aside className="flex w-full flex-col gap-10 rounded-2xl border border-grayscale-200 bg-white p-7 md:w-[380px] md:shrink-0 md:p-9">
      <div className="flex flex-col gap-3">
        <p className="text-headline-1 font-medium text-grayscale-500">보증금 / 월세</p>
        <p className="text-title-2 font-semibold text-grayscale-800">
          {formatManwon(price.depositKrw)} / {formatManwon(price.monthlyRentKrw)}
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <p className="text-center text-body-2 font-medium text-grayscale-500">
          예약 확정 전에는 요금이 청구되지 않아요.
        </p>
        <BtnCta
          size="l"
          className="w-full"
          disabled={!canRequestContract}
          loading={isRequestingContract}
          onClick={onRequestContract}
          title={!canRequestContract ? "방문 완료 후 계약을 진행할 수 있어요." : undefined}
        >
          바로 계약하기
        </BtnCta>
        <BtnCta
          variant="sub"
          size="l"
          className="w-full"
          onClick={canRequestVisit ? onRequestVisit : onViewReservation}
        >
          {canRequestVisit ? "방문 예약 신청" : "예약 내역 보기"}
        </BtnCta>
      </div>
    </aside>
  );
}

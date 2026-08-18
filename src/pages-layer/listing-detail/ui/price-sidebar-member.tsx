import { formatManwon, type RoomPrice } from "@/domains/listing";
import { BtnCta } from "@/shared/ui/btn-cta";
import { useToast } from "@/shared/ui/toast";

export interface PriceSidebarMemberProps {
  price: RoomPrice;
  onRequestVisit: () => void;
}

/**
 * 가격/예약 사이드바 — 회원 (Figma: node 1222:46291)
 *
 * "바로 계약하기"로 이어지는 계약 플로우는 이번 6개 디자인에 포함되지 않아
 * 아직 없습니다. 클릭 시 안내만 띄워둡니다.
 */
export function PriceSidebarMember({ price, onRequestVisit }: PriceSidebarMemberProps) {
  const { showToast } = useToast();

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
          onClick={() => showToast("계약 기능은 준비 중이에요.", { variant: "info" })}
        >
          바로 계약하기
        </BtnCta>
        <BtnCta variant="sub" size="l" className="w-full" onClick={onRequestVisit}>
          방문 예약 신청
        </BtnCta>
      </div>
    </aside>
  );
}

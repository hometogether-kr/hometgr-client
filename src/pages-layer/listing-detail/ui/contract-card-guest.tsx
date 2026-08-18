import { formatManwon, type RoomPrice } from "@/domains/listing";

import { DetailSection } from "./detail-section";
import { LockedPanel } from "./locked-panel";

export interface ContractCardGuestProps {
  price: RoomPrice;
  onRequireLogin: () => void;
}

/**
 * 가격 및 계약 조건 — 비회원 (Figma: node 1141:28053)
 *
 * 보증금/월세만 공개하고, 상세 계약 조건은 로그인 후에만 볼 수 있습니다.
 */
export function ContractCardGuest({ price, onRequireLogin }: ContractCardGuestProps) {
  return (
    <DetailSection title="가격 및 계약 조건">
      <div className="flex flex-col gap-3">
        <p className="text-headline-1 font-medium text-grayscale-500">보증금 / 월세</p>
        <p className="text-title-3 font-semibold text-grayscale-800">
          {formatManwon(price.depositKrw)} / {formatManwon(price.monthlyRentKrw)}
        </p>
      </div>
      <LockedPanel
        message="상세 계약 정보는 로그인 후 열람할 수 있어요."
        ctaLabel="상세 정보 보기"
        onRequireLogin={onRequireLogin}
      />
    </DetailSection>
  );
}

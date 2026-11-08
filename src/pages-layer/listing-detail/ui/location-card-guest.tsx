import { DetailSection } from "./detail-section";
import { LockedPanel } from "./locked-panel";

export interface LocationCardGuestProps {
  onRequireLogin: () => void;
}

/** 위치안내 — 비회원 (Figma: node 1141:28379) */
export function LocationCardGuest({ onRequireLogin }: LocationCardGuestProps) {
  return (
    <DetailSection title="위치안내">
      <LockedPanel
        message={GUEST_LOCATION_DISCLOSURE}
        ctaLabel="건물 위치 보기"
        onRequireLogin={onRequireLogin}
      />
    </DetailSection>
  );
}
import { GUEST_LOCATION_DISCLOSURE } from "@/domains/listing";

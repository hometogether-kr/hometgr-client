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
        message="로그인 후 정확한 위치를 확인하세요."
        ctaLabel="정확한 위치보기"
        onRequireLogin={onRequireLogin}
      />
    </DetailSection>
  );
}

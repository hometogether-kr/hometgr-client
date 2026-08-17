import { DetailSection } from "./detail-section";

export interface LocationCardMemberProps {
  mapImageUrl: string;
  locationNote: string;
}

/* eslint-disable @next/next/no-img-element -- 임시 Figma 에셋, 커밋된 이미지로 교체 예정 */

/**
 * 위치 — 회원 (Figma: node 1222:46098)
 *
 * 회원도 정확한 지도는 볼 수 있지만, 상세 위치(정확한 주소)는 방문 예약 후에만
 * 공개됩니다.
 */
export function LocationCardMember({ mapImageUrl, locationNote }: LocationCardMemberProps) {
  return (
    <DetailSection title="위치">
      <p className="-mt-3 text-body-1 font-normal text-grayscale-500">{locationNote}</p>
      <div className="h-[280px] w-full overflow-hidden rounded-xl md:h-[440px]">
        <img alt="매물 위치 지도" src={mapImageUrl} className="block size-full object-cover" />
      </div>
    </DetailSection>
  );
}

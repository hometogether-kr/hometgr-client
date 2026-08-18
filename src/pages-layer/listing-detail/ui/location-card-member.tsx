import { DetailSection } from "./detail-section";

export interface LocationCardMemberProps {
  locationNote: string;
}

/**
 * 위치 — 회원 (Figma: node 1222:46098)
 *
 * 공개 상세 API가 좌표·지도 이미지를 아직 내려주지 않아 지도 블록은 뺐습니다
 * (백엔드 보완 요청 대상). 상세 위치(정확한 주소)는 방문 예약 후에만 공개됩니다.
 */
export function LocationCardMember({ locationNote }: LocationCardMemberProps) {
  return (
    <DetailSection title="위치">
      <p className="text-body-1 font-normal text-grayscale-500">{locationNote}</p>
    </DetailSection>
  );
}

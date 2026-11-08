import { MEMBER_LOCATION_DISCLOSURE } from "@/domains/listing";
import { getKakaoMapJavaScriptKey } from "@/shared/config";
import { KakaoMap } from "@/shared/ui/kakao-map";

import { DetailSection } from "./detail-section";

export interface LocationCardMemberProps {
  buildingAddress: string | null;
}

export function LocationCardMember({ buildingAddress }: LocationCardMemberProps) {
  const mapKey = getKakaoMapJavaScriptKey();
  return (
    <DetailSection title="위치">
      <p className="text-body-1 font-normal text-grayscale-500">{MEMBER_LOCATION_DISCLOSURE}</p>
      {buildingAddress && (
        <p className="text-body-1 break-words text-grayscale-800">{buildingAddress}</p>
      )}
      {buildingAddress && mapKey ? (
        <KakaoMap address={buildingAddress} javaScriptKey={mapKey} label="매물 건물 위치 지도" />
      ) : (
        <div
          role="status"
          className="flex h-[320px] w-full items-center justify-center rounded-xl bg-grayscale-70 px-5 text-center text-grayscale-500 md:h-[440px]"
        >
          {buildingAddress
            ? "지도를 준비하고 있어요. 건물 주소를 참고해 주세요."
            : "확인된 건물 위치 정보가 아직 없어요. 카카오 채널로 문의해 주세요."}
        </div>
      )}
    </DetailSection>
  );
}

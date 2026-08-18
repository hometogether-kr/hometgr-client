import type { RoomHost } from "@/domains/listing";

const IC_PERSON = "/figma/ic-person-a94a696d.svg";

/* eslint-disable @next/next/no-img-element -- next/image는 dangerouslyAllowSVG 없이 SVG를 막습니다 */

export interface HostProfileCardProps {
  host: RoomHost;
}

/**
 * 집주인 프로필 카드 (Figma: node 1222:51935)
 *
 * 응답률·인증 배지·"함께 거주해요" 안내·집주인 소개는 공개 상세 API가 아직
 * 내려주지 않아 뺐습니다(백엔드 보완 요청 대상). 이름과 가입일만 표시합니다.
 */
export function HostProfileCard({ host }: HostProfileCardProps) {
  return (
    <section className="flex w-full flex-col gap-9 rounded-2xl border border-grayscale-200 px-6 py-7 md:px-9 md:py-8">
      <div className="flex items-center gap-6 md:gap-10">
        <span className="block size-20 shrink-0 overflow-clip rounded-full bg-grayscale-70 md:size-[120px]">
          <img alt="" src={IC_PERSON} className="block size-full max-w-none object-cover" />
        </span>
        <div className="flex flex-1 flex-col gap-4 md:gap-6">
          <p className="text-title-3 font-semibold text-grayscale-900">{host.name ?? "집주인"}</p>
          {host.joinedLabel && (
            <p className="text-body-1 font-medium text-grayscale-600">
              가입일 <span className="text-grayscale-800">{host.joinedLabel}</span>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

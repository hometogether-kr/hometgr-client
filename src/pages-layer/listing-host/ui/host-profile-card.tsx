import type { RoomHost } from "@/domains/listing";

const IC_PERSON = "/figma/ic-person-a94a696d.svg";
const IC_VERIFIED = "/figma/ic-verified-263493ca.svg";

/* eslint-disable @next/next/no-img-element -- next/image는 dangerouslyAllowSVG 없이 SVG를 막습니다 */

const BADGES = (host: RoomHost) =>
  [
    host.selfRegistered && "집주인 직접 등록",
    host.contactVerified && "연락처 확인 완료",
    host.hometogetherVerified && "홈투게더 확인 매물",
  ].filter((label): label is string => Boolean(label));

export interface HostProfileCardProps {
  host: RoomHost;
}

/**
 * 집주인 프로필 카드 (Figma: node 1222:51935)
 */
export function HostProfileCard({ host }: HostProfileCardProps) {
  const badges = BADGES(host);

  return (
    <section className="flex w-full flex-col gap-9 rounded-2xl border border-grayscale-200 px-6 py-7 md:px-9 md:py-8">
      <div className="flex items-center gap-6 md:gap-10">
        <span className="block size-20 shrink-0 overflow-clip rounded-full bg-grayscale-70 md:size-[120px]">
          <img alt="" src={IC_PERSON} className="block size-full max-w-none object-cover" />
        </span>
        <div className="flex flex-1 flex-col gap-4 md:gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-title-3 font-semibold text-grayscale-900">{host.name}</p>
              <p className="flex items-center gap-3 text-body-1 font-medium">
                <span className="text-grayscale-600">
                  응답률 <span className="text-grayscale-800">{host.responseRatePercent}%</span>
                </span>
                <span className="h-3.5 w-px bg-grayscale-200" aria-hidden="true" />
                <span className="text-grayscale-600">
                  가입일 <span className="text-grayscale-800">{host.joinedLabel}</span>
                </span>
              </p>
            </div>
            {host.livesWithGuests && (
              <p className="text-body-1 font-medium text-primary-500">
                호스트가 집에 함께 거주해요
              </p>
            )}
          </div>
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {badges.map((label) => (
                <span
                  key={label}
                  className="flex items-center gap-1 rounded-lg bg-primary-100 px-2 py-1.5"
                >
                  <img alt="" src={IC_VERIFIED} className="block size-4 max-w-none" />
                  <span className="text-caption-1 font-medium text-primary-500">{label}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-[10px] bg-grayscale-50 px-8 py-6">
        <p className="text-body-1 leading-[1.6] font-semibold text-grayscale-800">집주인 소개</p>
        <p className="text-body-1 leading-[1.5] font-normal text-grayscale-800">
          {host.introduction}
        </p>
      </div>
    </section>
  );
}

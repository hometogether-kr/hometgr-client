import Link from "next/link";

import type { RoomHost } from "@/domains/listing";
import { ROUTES } from "@/shared/config";

import { DetailSection } from "./detail-section";

const IC_PERSON = "/figma/ic-person-e166a1d5.svg";
const IC_VERIFIED = "/figma/ic-verified-f66694c3.svg";

/* eslint-disable @next/next/no-img-element -- next/image는 dangerouslyAllowSVG 없이 SVG를 막습니다 */

export interface HostCardProps {
  roomId: string;
  host: RoomHost;
}

/**
 * 집주인 정보 요약 카드 (Figma: node 1141:28621)
 *
 * 매물 상세에서는 요약 정보만 보여주고, 클릭하면 집주인 상세 페이지로 이동합니다.
 * 회원 여부와 무관하게 항상 같은 내용을 보여줍니다.
 */
export function HostCard({ roomId, host }: HostCardProps) {
  return (
    <DetailSection title="집주인 정보">
      <Link
        href={ROUTES.roomHost(roomId)}
        className="flex items-center gap-6 rounded-xl p-2 transition-opacity hover:opacity-80 md:gap-8"
      >
        <span className="block size-16 shrink-0 overflow-clip rounded-full bg-grayscale-70 md:size-[84px]">
          <img alt="" src={IC_PERSON} className="block size-full max-w-none object-cover" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-3 md:gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-heading-1 font-medium text-grayscale-800">{host.name}</p>
            {host.isVerified && (
              <span className="flex items-center gap-1 rounded-full bg-grayscale-70 px-2 py-1.5">
                <img alt="" src={IC_VERIFIED} className="block size-4 max-w-none" />
                <span className="text-caption-1 font-medium text-grayscale-600">신원인증 완료</span>
              </span>
            )}
          </div>
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
      </Link>
    </DetailSection>
  );
}

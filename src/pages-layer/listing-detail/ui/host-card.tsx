import Link from "next/link";

import type { RoomHost } from "@/domains/listing";
import { ROUTES } from "@/shared/config";

import { DetailSection } from "./detail-section";

const IC_PERSON = "/figma/ic-person-e166a1d5.svg";

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
 *
 * 신원인증 배지·응답률은 공개 상세 API가 아직 내려주지 않아 뺐습니다
 * (백엔드 보완 요청 대상).
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
          <p className="text-heading-1 font-medium text-grayscale-800">{host.name ?? "집주인"}</p>
          {host.joinedLabel && (
            <p className="text-body-1 font-medium text-grayscale-600">
              가입일 <span className="text-grayscale-800">{host.joinedLabel}</span>
            </p>
          )}
        </div>
      </Link>
    </DetailSection>
  );
}

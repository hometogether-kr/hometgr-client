import type { RoomDetail } from "@/domains/listing";

import { DetailSection } from "./detail-section";

export interface ContractCardMemberProps {
  room: Pick<RoomDetail, "buildingTypeLabel" | "roomSizeLabel" | "floor" | "price">;
}

interface Stat {
  label: string;
  value: string;
}

function StatTile({ label, value }: Stat) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl bg-grayscale-50 py-7">
      <p className="text-headline-1 font-medium text-grayscale-500">{label}</p>
      <p className="text-heading-1 font-semibold text-grayscale-800">{value}</p>
    </div>
  );
}

/**
 * 가격 및 계약 조건 — 회원 (Figma: node 1222:45322)
 *
 * 매물 형태 · 방 크기 · (있으면) 해당 층 · 관리비를 통계 타일로 보여줍니다.
 * 신규 등록 매물은 정확한 층수를 입력받지 않아 `floor`가 없을 수 있습니다.
 */
export function ContractCardMember({ room }: ContractCardMemberProps) {
  const stats: Stat[] = [
    { label: "매물 형태", value: room.buildingTypeLabel },
    { label: "방 크기", value: room.roomSizeLabel },
    ...(room.floor !== undefined ? [{ label: "해당 층", value: `${room.floor}층` }] : []),
    { label: "관리비", value: `월 ${Math.round(room.price.maintenanceFeeKrw / 10_000)}만원` },
  ];

  return (
    <DetailSection title="가격 및 계약 조건">
      <div className="flex flex-col gap-4 md:flex-row">
        {stats.map((stat) => (
          <StatTile key={stat.label} {...stat} />
        ))}
      </div>
    </DetailSection>
  );
}

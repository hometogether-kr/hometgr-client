import Image from "next/image";
import Link from "next/link";

import { formatRoomPrice } from "../model/format-room-price";
import type { Room } from "../model/room";
import { RoomAvailabilityChip } from "./room-availability-chip";

interface RoomCardProps {
  room: Room;
  href: string;
  /** 첫 행(4장)만 true — LCP 최적화 (설계 §6.1) */
  priority?: boolean;
}

/**
 * 매물 카드 (Figma `card_매물카드`, 365×375)
 *
 * 카드 전체가 링크 하나입니다. 카드 안에 별도 인터랙티브 요소(찜하기 등)가 생기면
 * 그때 중첩 인터랙티브를 피하려 마크업을 바꿉니다 — 지금 디자인엔 카드 내 버튼이 없습니다.
 *
 * stage-0 데이터가 비어 오는 경우를 대비합니다: 사진이 없으면 회색 박스, 교통 요약이
 * 없으면 위치만 표시합니다(설계 §11 — 디자이너 확인 대기).
 */
export function RoomCard({ room, href, priority = false }: RoomCardProps) {
  const location = [room.neighborhood, room.transitSummary].filter(Boolean).join(" · ");

  return (
    <li>
      <Link
        href={href}
        className="group block rounded-2xl focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <div className="relative h-[255px] w-full overflow-hidden rounded-2xl">
          {room.thumbnailUrl ? (
            <Image
              src={room.thumbnailUrl}
              alt={`${room.buildingName} 대표 사진`}
              fill
              sizes="(min-width: 1440px) 365px, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
              priority={priority}
              className="object-cover"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex h-full w-full items-center justify-center bg-grayscale-200 text-label-1 font-medium text-grayscale-400"
            >
              사진 준비 중
            </div>
          )}
          {/* 상단 그라디언트 — 흰 배경의 가용성 칩 가독성 확보 (black/20 → transparent 87%) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 to-transparent to-[87%]"
          />
          <RoomAvailabilityChip
            availability={room.availability}
            className="absolute top-4 left-4"
          />
        </div>

        <div className="mt-4 flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h3 className="text-headline-1 text-grayscale-700">{room.buildingName}</h3>
            <p className="text-heading-1 font-semibold text-grayscale-900">
              {formatRoomPrice(room.deposit, room.monthlyRent)}
            </p>
          </div>
          {location && <p className="text-body-1 text-grayscale-400">{location}</p>}
        </div>
      </Link>
    </li>
  );
}
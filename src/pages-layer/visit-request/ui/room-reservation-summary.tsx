import Image from "next/image";

import { Icon } from "@/shared/ui/icons";

export interface RoomReservationSummaryProps {
  roomId: string;
}

export function RoomReservationSummary({ roomId }: RoomReservationSummaryProps) {
  return (
    <section className="flex flex-col gap-5 rounded-[20px] bg-white p-5 sm:flex-row md:p-7">
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-[10px] sm:h-[140px] sm:w-[140px]">
        <Image
          src="/figma/room-photo-7451d61e.png"
          alt="예약할 매물 대표 사진"
          fill
          sizes="(max-width: 639px) 100vw, 140px"
          className="object-cover"
          priority
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-4">
        <div>
          <p className="text-caption-1 font-medium text-primary-500">매물 {roomId}</p>
          <h2 className="mt-1 text-headline-1 font-bold text-grayscale-900 md:text-heading-2">
            햇살 가득한 성수동 여성 전용 쉐어하우스
          </h2>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-label-1 text-grayscale-600">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="location_on" size={18} className="text-grayscale-400" />
            서울 성동구 · 성수역 도보 8분
          </span>
          <span className="inline-flex items-center gap-1.5 font-semibold text-grayscale-800">
            <Icon name="payments" size={18} className="text-grayscale-400" />
            보증금 500만원 / 월세 55만원
          </span>
        </div>
      </div>
    </section>
  );
}

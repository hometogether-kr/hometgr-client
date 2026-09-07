import Image from "next/image";

import { formatManwon, type RoomDetail } from "@/domains/listing";
import { Icon } from "@/shared/ui/icons";

export interface RoomReservationSummaryProps {
  room: RoomDetail;
}

export function RoomReservationSummary({ room }: RoomReservationSummaryProps) {
  const photo = room.photos[0];

  return (
    <section className="flex flex-col gap-5 rounded-[20px] bg-white p-5 sm:flex-row md:p-7">
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-[10px] sm:h-[140px] sm:w-[140px]">
        {photo ? (
          <Image
            src={photo.url}
            alt={photo.alt}
            fill
            sizes="(max-width: 639px) 100vw, 140px"
            className="object-cover"
            priority
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-grayscale-70 text-grayscale-400">
            <Icon name="image" size={28} />
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-4">
        <div>
          <p className="text-caption-1 font-medium text-primary-500">방문할 매물</p>
          <h2 className="mt-1 text-headline-1 font-bold text-grayscale-900 md:text-heading-2">
            {room.title}
          </h2>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-label-1 text-grayscale-600">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="location_on" size={18} className="text-grayscale-400" />
            {room.locationSummary || "위치 정보 없음"}
          </span>
          <span className="inline-flex items-center gap-1.5 font-semibold text-grayscale-800">
            <Icon name="payments" size={18} className="text-grayscale-400" />
            보증금 {formatManwon(room.price.depositKrw)} / 월세{" "}
            {formatManwon(room.price.monthlyRentKrw)}
          </span>
        </div>
      </div>
    </section>
  );
}

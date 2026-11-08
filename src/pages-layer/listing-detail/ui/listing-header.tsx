import type { RoomDetail } from "@/domains/listing";

export interface ListingHeaderProps {
  room: RoomDetail;
}

/**
 * 매물 제목/주소 (Figma: node 1222:29434)
 */
export function ListingHeader({ room }: ListingHeaderProps) {
  return (
    <div className="flex w-full items-start justify-between gap-4">
      <div className="flex min-w-0 flex-1 flex-col gap-3 md:gap-4">
        <h1 className="text-[28px] leading-[1.3] font-semibold tracking-[-0.02em] break-words text-grayscale-900 md:text-[40px]">
          {room.title}
        </h1>
        {room.subtitle && (
          <p className="text-headline-1 break-words text-grayscale-600">{room.subtitle}</p>
        )}
        <div className="flex flex-wrap gap-3 text-headline-1 font-medium">
          <span className="text-grayscale-600">{room.addressRegion ?? room.locationSummary}</span>
          <span className="text-primary-400">{room.addressDisclosureNote}</span>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  fetchHostRoom,
  fetchHostRooms,
  hostRoomQueryKeys,
  type HostRoomSummary,
} from "@/domains/listing-draft";
import {
  LISTING_FILTERS,
  type ListingFilter,
  type ListingManagementCommands,
  listingStatus,
  ListingVisibilityToggle,
} from "@/features/manage-listing";
import { ROUTES } from "@/shared/config";
import { cn } from "@/shared/lib/cn";
import { useToast } from "@/shared/ui/toast";

function RoomThumbnail({ room }: { room: HostRoomSummary }) {
  const query = useQuery({
    queryKey: hostRoomQueryKeys.detail(room.id),
    queryFn: ({ signal }) => fetchHostRoom(room.id, signal),
    enabled: room.registrationContractVersion === 2,
  });
  const photo = query.data?.media.find((p) => p.isRepresentative) ?? query.data?.media[0];
  return (
    <div className="h-[133px] w-[130px] shrink-0 overflow-hidden rounded-2xl bg-grayscale-100">
      {photo && (
        <Image
          src={photo.readUrl}
          width={130}
          height={133}
          alt=""
          unoptimized
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}

interface ListingManagementListProps {
  rooms: HostRoomSummary[];
  filter: ListingFilter;
  onFilterChange: (filter: ListingFilter) => void;
  commands?: ListingManagementCommands;
  onVisibilityChange?: (roomId: string, isPublic: boolean) => void;
  editHref?: (roomId: string) => string;
  thumbnails?: Record<string, string>;
  viewCounts?: Record<string, number>;
}

export function ListingManagementList({
  rooms,
  filter,
  onFilterChange,
  commands,
  onVisibilityChange,
  editHref = ROUTES.listing.edit,
  thumbnails,
  viewCounts,
}: ListingManagementListProps) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const { showToast } = useToast();
  const filtered = rooms.filter(
    (room) =>
      filter === "전체" || listingStatus(room) === (filter === "노출 중" ? "공개 중" : filter),
  );
  const handleVisibilityChange = async (room: HostRoomSummary) => {
    if (!commands || pendingId) return;
    setPendingId(room.id);
    try {
      await commands.setVisibility(room.id, !room.isPublic);
      onVisibilityChange?.(room.id, !room.isPublic);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.", {
        variant: "error",
      });
    } finally {
      setPendingId(null);
    }
  };
  return (
    <>
      <div className="mb-11 flex flex-wrap items-center gap-4 pl-[19px] md:h-[25px]">
        <h1 className="text-[28px] leading-[1.4] font-semibold tracking-[-1.8px] text-black md:text-4xl">
          내 방 관리
        </h1>
        <p className="flex items-center gap-2 text-base font-semibold text-grayscale-500">
          <Image src="/images/listing-management/info.svg" width={13} height={13} alt="" />
          관리 중인 방이 총 {rooms.length}개 있습니다.
        </p>
      </div>
      <section className="rounded-[28px] bg-white p-4 md:p-8" aria-label="내 방 관리">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <nav aria-label="매물 필터" className="flex max-w-full gap-1 overflow-x-auto">
            {LISTING_FILTERS.map((value) => (
              <button
                type="button"
                key={value}
                aria-current={filter === value ? "true" : undefined}
                onClick={() => onFilterChange(value)}
                className={cn(
                  "shrink-0 rounded-[15px] border-2 border-transparent px-3 py-3 text-sm leading-3 font-bold whitespace-nowrap text-grayscale-600 hover:bg-primary-100 focus-visible:outline-2 focus-visible:outline-primary-500 md:px-4 md:py-[14px] md:text-base",
                  filter === value && "border-primary-500 text-primary-500",
                )}
              >
                {value}
              </button>
            ))}
          </nav>
          <Link
            href={ROUTES.listing.start}
            className="rounded-xl bg-grayscale-50 px-4 py-[14px] text-base leading-4 font-bold text-primary-500"
          >
            방 추가
          </Link>
        </div>
        <ul className="flex flex-col gap-7">
          {filtered.map((room, index) => {
            const status = listingStatus(room);
            const reviewing = status === "심사 중";
            return (
              <li
                key={room.id}
                className={cn(
                  "pb-7",
                  index !== filtered.length - 1 && "border-b border-dashed border-grayscale-100",
                )}
              >
                <article className="flex flex-wrap gap-4 md:flex-nowrap">
                  {thumbnails?.[room.id] ? (
                    <Image
                      src={thumbnails[room.id]}
                      width={130}
                      height={133}
                      alt=""
                      className="h-[133px] w-[130px] shrink-0 rounded-2xl object-cover"
                    />
                  ) : (
                    <RoomThumbnail room={room} />
                  )}
                  <div className="flex min-w-0 flex-1 flex-col items-start justify-between">
                    <p className="flex items-center gap-2 text-sm leading-[21px] text-black/80">
                      <span
                        className={cn(
                          "size-2 rounded-full",
                          reviewing
                            ? "bg-[#ff9e37]"
                            : status === "계약 중"
                              ? "bg-primary-200"
                              : room.isPublic
                                ? "bg-[#7bc974]"
                                : "bg-grayscale-700",
                        )}
                      />
                      {status}
                      {room.isPublic && viewCounts?.[room.id] !== undefined && (
                        <span>{viewCounts[room.id]}회 조회</span>
                      )}
                    </p>
                    <h2 className="mb-3 text-lg leading-[1.4] font-bold tracking-[-1.2px] text-grayscale-800 md:mb-0 md:text-2xl">
                      {room.title}
                    </h2>
                    <dl className="flex max-w-full flex-col gap-2 rounded-xl bg-grayscale-70 px-[18px] py-3 text-sm leading-[1.1]">
                      <div className="flex gap-3">
                        <dt className="shrink-0 text-black/35">등록일</dt>
                        <dd className="text-black/80">
                          {new Intl.DateTimeFormat("ko-KR", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            timeZone: "Asia/Seoul",
                          })
                            .format(new Date(room.createdAt))
                            .replace(/\.$/, "")}
                        </dd>
                      </div>
                      <div className="flex gap-3">
                        <dt className="shrink-0 text-black/35">위치</dt>
                        <dd className="break-words text-black/80">
                          {room.addressRegion || room.approximateLocation}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <div className="ml-auto flex w-full flex-row items-center justify-between gap-4 md:w-auto md:shrink-0 md:flex-col md:items-end">
                    {reviewing ? (
                      <p className="text-base text-black/35">심사 중에는 수정이 제한됩니다</p>
                    ) : (
                      <Link
                        href={editHref(room.id)}
                        className="px-1 text-base font-bold text-black/35 hover:text-primary-500"
                      >
                        수정
                      </Link>
                    )}
                    {!reviewing && (
                      <ListingVisibilityToggle
                        isPublic={room.isPublic}
                        disabled={
                          !commands ||
                          ![
                            "published",
                            "hidden",
                            "contractInProgress",
                            "contractCompleted",
                          ].includes(room.roomStatus)
                        }
                        pending={pendingId === room.id}
                        onToggle={() => void handleVisibilityChange(room)}
                      />
                    )}
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
        <Link
          href={ROUTES.listing.start}
          className="mt-6 flex h-[72px] items-center justify-center rounded-xl bg-grayscale-50 text-[22px] font-bold tracking-[-.22px] text-primary-500"
        >
          방 추가
        </Link>
      </section>
    </>
  );
}

export function ConnectedListingManagementList({ filter }: { filter: ListingFilter }) {
  const router = useRouter();
  const query = useQuery({
    queryKey: hostRoomQueryKeys.list(),
    queryFn: ({ signal }) => fetchHostRooms(signal),
  });
  if (query.isPending)
    return <div className="h-[1100px] animate-pulse rounded-[28px] bg-white" aria-busy="true" />;
  if (query.isError) return <p role="alert">{query.error.message}</p>;
  return (
    <ListingManagementList
      rooms={query.data}
      filter={filter}
      onFilterChange={(next) =>
        router.replace(`${ROUTES.listing.manage}?filter=${encodeURIComponent(next)}`, {
          scroll: false,
        })
      }
    />
  );
}

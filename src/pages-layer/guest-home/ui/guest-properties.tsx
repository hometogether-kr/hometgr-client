"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import type { SearchRegion } from "@/domains/region";
import { fetchRooms, type Room, roomQueryKeys } from "@/domains/room";
import {
  EMPTY_ROOM_FILTER,
  getRoomRegionFilter,
  serializeRoomFilter,
  toRoomListQuery,
  useRoomFilterRegions,
} from "@/features/filter-rooms";
import { ROUTES } from "@/shared/config";

import styles from "./guest-home.module.css";

function PropertyCard({ room }: { room: Room }) {
  return (
    <Link href={`${ROUTES.rooms}/${room.id}`} className={styles.propertyCard}>
      <span className={styles.propertyImage}>
        {room.thumbnailUrl ? (
          <Image
            src={room.thumbnailUrl}
            alt=""
            fill
            sizes="(max-width: 600px) 45vw, (max-width: 1000px) 30vw, 282px"
            unoptimized
          />
        ) : (
          <span className="flex h-full items-center justify-center bg-grayscale-100 text-grayscale-500">
            사진 준비 중
          </span>
        )}
      </span>
      <span className={styles.propertyName}>{room.buildingName}</span>
    </Link>
  );
}

function PropertyResults({ region, limit }: { region?: SearchRegion; limit: number }) {
  const filter = { ...EMPTY_ROOM_FILTER, ...getRoomRegionFilter(region ?? null) };
  const query = useQuery({
    queryKey: roomQueryKeys.home(serializeRoomFilter(filter)),
    queryFn: ({ signal }) => fetchRooms(toRoomListQuery(filter), signal),
  });
  if (query.isPending)
    return (
      <div role="status" aria-label="매물을 불러오고 있어요" className={styles.propertyGrid}>
        {Array.from({ length: limit }, (_, index) => (
          <div key={index} aria-hidden="true" className={styles.propertyCard}>
            <span className={`${styles.propertyImage} bg-grayscale-100`} />
            <span className={`${styles.propertyName} text-transparent`}>불러오는 중</span>
          </div>
        ))}
      </div>
    );
  if (query.isError)
    return (
      <div className={styles.emptyRegion} role="alert">
        <p>매물을 불러오지 못했습니다.</p>
        <button
          type="button"
          onClick={() => void query.refetch()}
          disabled={query.isFetching}
          className="mt-3 underline"
        >
          다시 시도
        </button>
      </div>
    );
  if (!query.data.rooms.length)
    return (
      <p className={styles.emptyRegion} role="status">
        등록된 매물이 없습니다.
      </p>
    );
  return (
    <div className={styles.propertyGrid}>
      {query.data.rooms.slice(0, limit).map((room) => (
        <PropertyCard key={room.id} room={room} />
      ))}
    </div>
  );
}

export function GuestProperties() {
  const regions = useRoomFilterRegions();
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const region =
    regions.data?.find((item) => item.sigungu === selectedDistrict) ?? regions.data?.[0];
  return (
    <section className={styles.properties} aria-labelledby="guest-properties-title">
      <div className={styles.container}>
        <h2 className={styles.heading} id="guest-properties-title">
          지역별 매물
        </h2>
        <div className={styles.regionTabs} aria-label="매물 지역">
          {(regions.data ?? []).map((item) => (
            <button
              type="button"
              key={item.sigungu}
              aria-pressed={region?.sigungu === item.sigungu}
              onClick={() => setSelectedDistrict(item.sigungu)}
            >
              {item.name}
            </button>
          ))}
        </div>
        {regions.isPending ? (
          <p role="status" className={styles.emptyRegion}>
            지역 목록을 불러오고 있어요.
          </p>
        ) : regions.isError ? (
          <div role="alert" className={styles.emptyRegion}>
            <p>지역 목록을 불러오지 못했어요.</p>
            <button
              type="button"
              disabled={regions.isFetching}
              onClick={() => void regions.refetch()}
              className="mt-3 underline"
            >
              다시 시도
            </button>
          </div>
        ) : region ? (
          <PropertyResults region={region} limit={8} />
        ) : (
          <p role="status" className={styles.emptyRegion}>
            현재 공개 매물이 있는 지역이 없습니다.
          </p>
        )}
        <h3 className={styles.newPropertiesHeading}>신규 등록 매물</h3>
        <PropertyResults limit={4} />
      </div>
    </section>
  );
}

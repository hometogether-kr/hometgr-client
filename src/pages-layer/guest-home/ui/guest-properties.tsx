"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { fetchRooms, type Room, roomQueryKeys } from "@/domains/room";
import { ROUTES } from "@/shared/config";

import styles from "./guest-home.module.css";

const regions = ["노원구", "동대문구", "신촌", "동작구", "성북구"];

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

function PropertyResults({ region, limit }: { region?: string; limit: number }) {
  const query = useQuery({
    queryKey: roomQueryKeys.home(region),
    queryFn: ({ signal }) => fetchRooms({ page: 1, sort: "latest", region }, signal),
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
  const [region, setRegion] = useState("노원구");
  return (
    <section className={styles.properties} aria-labelledby="guest-properties-title">
      <div className={styles.container}>
        <h2 className={styles.heading} id="guest-properties-title">
          지역별 매물
        </h2>
        <div className={styles.regionTabs} aria-label="매물 지역">
          {regions.map((item) => (
            <button
              type="button"
              key={item}
              aria-pressed={region === item}
              onClick={() => setRegion(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <PropertyResults region={region} limit={8} />
        <h3 className={styles.newPropertiesHeading}>신규 등록 매물</h3>
        <PropertyResults limit={4} />
      </div>
    </section>
  );
}

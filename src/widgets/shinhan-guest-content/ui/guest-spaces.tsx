import Image from "next/image";

import { ShinhanEntryNotice } from "@/features/shinhan-intake";

import styles from "./guest-spaces.module.css";

const spaces = [
  {
    image: "/images/shinhan/guest/space-private-room.png",
    caption: "오직 혼자쓰는 나의 방",
    description: "침대와 책상, 창문이 있는 개인방 예시",
  },
  {
    image: "/images/shinhan/guest/space-living-room.png",
    caption: "함께 쉬는 거실",
    description: "소파와 테이블이 놓인 공용 거실 예시",
  },
  {
    image: "/images/shinhan/guest/space-kitchen.png",
    caption: "함께 쓰는 주방",
    description: "냉장고와 조리대, 식탁이 있는 공용 주방 예시",
  },
];

const regions = [
  { name: "노원구", image: "/images/guest-landing/imgFrame251.png" },
  { name: "동작구", image: "/images/guest-landing/imgFrame252.png" },
  { name: "동대문구", image: "/images/guest-landing/imgFrame253.png" },
  { name: "성북구", image: "/images/guest-landing/imgFrame254.png" },
];

export function ShinhanGuestSpaces() {
  return (
    <section className={styles.spaces} aria-labelledby="shinhan-guest-spaces-heading">
      <div className={styles.container}>
        <header className={styles.introduction}>
          <p className={styles.eyebrow}>혼자 쓰는 방, 함께 쓰는 집</p>
          <h2 id="shinhan-guest-spaces-heading" className={styles.heading}>
            <span>학교는 가까이,</span> <em>내 방은 혼자.</em>
          </h2>
          <p className={styles.description}>
            공부하고 쉬는 시간은 나만의 방에서.
            <br />
            주방과 거실은 함께 쓰며 주거비 부담을 덜어보세요.
          </p>
        </header>
        <div className={styles.gallery}>
          {spaces.map((space) => (
            <figure key={space.caption} className={styles.space}>
              <div className={styles.spacePhoto}>
                <Image
                  src={space.image}
                  alt={space.description}
                  fill
                  sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1279px) 33vw, 384px"
                />
              </div>
              <figcaption>{space.caption}</figcaption>
            </figure>
          ))}
        </div>
        <div className={styles.actions}>
          <p className={styles.counseling}>자세한 비용과 생활 조건은 상담으로 안내해드려요.</p>
          <p id="shinhan-guest-space-notice" className={styles.notice}>
            공간 사진은 예시입니다.{" "}
            <ShinhanEntryNotice>희망하는 입주 조건을 알려 주세요.</ShinhanEntryNotice>
          </p>
        </div>
      </div>
    </section>
  );
}

export function ShinhanGuestRegions() {
  return (
    <section className={styles.regions} aria-labelledby="shinhan-guest-regions-heading">
      <div className={styles.container}>
        <h2 id="shinhan-guest-regions-heading" className={styles.regionHeading}>
          지역별 매물
        </h2>
        <ul className={styles.regionList}>
          {regions.map((region) => (
            <li key={region.name}>
              <figure className={styles.regionCard}>
                <span className={styles.regionPhoto}>
                  <Image
                    src={region.image}
                    alt={`${region.name} 공간 예시`}
                    fill
                    sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1023px) 50vw, (max-width: 1279px) 25vw, 282px"
                  />
                </span>
                <figcaption className={styles.regionName}>{region.name}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
        <p id="shinhan-guest-region-notice" className={styles.regionNotice}>
          공간 예시 사진입니다.
        </p>
      </div>
    </section>
  );
}

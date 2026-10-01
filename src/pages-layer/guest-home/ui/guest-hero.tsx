import Image from "next/image";

import { GuestRoomSearch } from "./guest-room-search";

import styles from "./guest-home.module.css";

export function GuestHero() {
  return (
    <section className={styles.hero} aria-labelledby="guest-title">
      <div className={`${styles.container} ${styles.heroInner}`}>
        <div className={styles.heroCopy}>
          <p>함께 살아 더 안전한 홈투게더</p>
          <h1 id="guest-title">
            학교 앞 아파트에서
            <br />
            <em>넓은</em> 내 방,
            <br />
            월세는 <em>가볍게</em>
          </h1>
          <GuestRoomSearch />
        </div>
        <div className={styles.heroArt}>
          <Image
            src="/images/guest-landing/imgGroup84.svg"
            alt=""
            width={633}
            height={532}
            preload
          />
        </div>
      </div>
    </section>
  );
}

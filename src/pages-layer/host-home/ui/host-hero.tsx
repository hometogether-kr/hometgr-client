import Image from "next/image";

import { HostConsultationButton } from "@/features/request-host-consultation";

import { hostContainer } from "./section-heading";

import styles from "./host-layout.module.css";

export function HostHero() {
  return (
    <section className={styles.hero}>
      <div className={`${hostContainer} ${styles.heroContent}`}>
        <div className={styles.heroCopy}>
          <h1>
            비어 있는 <strong>방 한 칸,</strong>
            <br />
            <strong>검증된 청년</strong>으로 안심하고,
            <br />
            <strong>매달 생활비</strong>로 여유롭게.
          </h1>
          <p>
            방 준비부터 청년 입주, 거주 중 관리까지
            <br />
            홈투게더가 함께합니다.
          </p>
          <div className={styles.heroCta}>
            <HostConsultationButton />
          </div>
        </div>
        <div className={styles.heroArt}>
          <Image
            src="/images/host-landing/hero.png"
            alt="비어 있는 방 한 칸을 생활비로 활용하는 집 평면도"
            width={837}
            height={730}
            preload
            sizes="(min-width: 1280px) 837px, 100vw"
          />
        </div>
      </div>
    </section>
  );
}

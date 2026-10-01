import Image from "next/image";

import { GuestRegionForm } from "@/features/request-guest-region";
import { StartHostListingLink } from "@/features/start-host-listing";
import { SiteLayout } from "@/widgets/site-layout";

import { GuestBenefits } from "./ui/guest-benefits";
import { GuestHero } from "./ui/guest-hero";
import { GuestProperties } from "./ui/guest-properties";
import { GuestQuestions } from "./ui/guest-questions";
import { GuestReviews } from "./ui/guest-reviews";

import styles from "./ui/guest-home.module.css";

export function GuestHomePage() {
  return (
    <SiteLayout background="white">
      {/* eslint-disable-next-line @next/next/no-page-custom-font -- Figma의 Noto Sans KR는 입주자 페이지에만 적용합니다. */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap"
      />
      <GuestHero />
      <GuestProperties />
      <GuestBenefits />
      <section className={styles.hostBand} aria-labelledby="guest-host-title">
        <div className={`${styles.container} ${styles.hostBandInner}`}>
          <div>
            <p>홈투게더에서 거주 중인 집에 비어있는 방으로</p>
            <h2 id="guest-host-title">홈쉐어를 시작해 보세요</h2>
          </div>
          <StartHostListingLink className={styles.hostLink}>
            홈투게더에 방 등록하기
            <Image src="/images/guest-landing/img.svg" width={28} height={28} alt="" />
          </StartHostListingLink>
        </div>
      </section>
      <GuestReviews />
      <section className={`${styles.section} ${styles.muted}`} aria-labelledby="guest-region-title">
        <div className={styles.container}>
          <h2 id="guest-region-title" className={styles.heading}>
            원하시는 지역에 방이 없나요?
          </h2>
          <p className={styles.regionDescription}>
            찾고 싶은 동네나 학교 근처를 알려주세요.
            <br />
            해당 지역에 새로운 방이 등록되면 가장 먼저 알려드릴게요.
          </p>
          <GuestRegionForm />
          <div className={styles.channelRow}>
            <p>
              카카오 채널을 추가해두시면 주기적으로 업데이트되는 매물정보를 먼저 받아보실 수 있어요.
            </p>
            <a href="https://pf.kakao.com/_BKlhX" target="_blank" rel="noopener noreferrer">
              채널 추가
            </a>
          </div>
        </div>
      </section>
      <GuestQuestions />
    </SiteLayout>
  );
}

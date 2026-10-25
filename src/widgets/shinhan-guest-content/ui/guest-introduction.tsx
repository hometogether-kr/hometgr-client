import Image from "next/image";

import {
  ShinhanEntryNotice,
  ShinhanGuestDemandSearch,
  ShinhanGuestFormButton,
} from "@/features/shinhan-intake";

import styles from "./guest-introduction.module.css";

const conversations = [
  {
    topic: "매일의 통학",
    title: "학교는 가까웠으면 좋겠어요.",
    body: "오가는 길에 하루가 다 가는 기분이에요.",
    image: "student",
  },
  {
    topic: "함께 쓰는 방",
    title: "쉬는 시간만큼은 혼자 있고 싶어요.",
    body: "기숙사에서는 내 공간이 아쉬워요.",
    image: "woman",
  },
  {
    topic: "혼자 사는 비용",
    title: "월세도, 부모님 걱정도 마음에 걸려요.",
    body: "혼자 자취하자니 부담이 커요.",
    image: "man",
  },
];

export function ShinhanGuestHero() {
  return (
    <section className={styles.hero} aria-labelledby="shinhan-guest-heading">
      <div className={`${styles.container} ${styles.heroContent}`}>
        <div className={styles.partnership} aria-label="신한 슈퍼SOL × 홈투게더">
          <span className={styles.sol}>
            <Image src="/images/shinhan/super-sol.png" alt="" width={28} height={28} />
            신한 슈퍼SOL
          </span>
          <span aria-hidden="true">×</span>
          <Image
            src="/images/shinhan/home-together-footer.svg"
            alt="Home Together"
            width={155}
            height={28}
          />
        </div>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>함께 살아 더 안전한 홈투게더</p>
          <h1 id="shinhan-guest-heading">
            학교 앞 아파트에서
            <br />
            <em>넓은</em> 내 방,
            <br />
            월세는 <em>가볍게</em>
          </h1>
          <div className={styles.location}>
            <ShinhanGuestDemandSearch
              fieldClassName={styles.locationField}
              buttonClassName={styles.searchButton}
            />
            <p id="shinhan-guest-demand-status" className={styles.notice}>
              <ShinhanEntryNotice>
                희망 지역과 조건을 입력하고 입주 안내를 신청해 보세요.
              </ShinhanEntryNotice>
            </p>
          </div>
        </div>
        <div className={styles.heroArt}>
          <Image
            src="/images/shinhan/guest/hero.svg"
            alt="학교 근처의 아파트를 표현한 파란 건물 일러스트"
            width={633}
            height={532}
            preload
          />
        </div>
      </div>
    </section>
  );
}

export function ShinhanGuestBudgetBanner() {
  return (
    <section className={styles.bannerSection} aria-labelledby="shinhan-guest-budget-heading">
      <div className={`${styles.container} ${styles.banner}`}>
        <div className={styles.bannerCopy}>
          <h2 id="shinhan-guest-budget-heading">
            내 예산이면,
            <br />
            어떤 아파트에서 살 수 있을까?
          </h2>
          <p>
            원룸 예산으로 아파트 생활을 시작해볼까요?
            <br />내 예산에 맞는 방을 확인해보세요.
          </p>
          <ShinhanGuestFormButton
            flow="budget"
            type="button"
            size="l"
            className={styles.budgetButton}
            aria-describedby="shinhan-guest-budget-status"
            data-shinhan-guest-budget-cta
          >
            내 예산에 맞는 방 보기&nbsp; →
          </ShinhanGuestFormButton>
          <p id="shinhan-guest-budget-status" className={styles.notice}>
            <ShinhanEntryNotice>예산을 입력하고 상세조건 안내를 신청해 보세요.</ShinhanEntryNotice>
          </p>
        </div>
        <div className={styles.bannerArt}>
          <Image
            src="/images/shinhan/guest/budget-banner.png"
            alt="홈투게더 집 캐릭터가 아파트 모형을 소개하는 모습"
            width={1983}
            height={793}
            sizes="(max-width: 767px) calc(100vw - 40px), 800px"
          />
        </div>
      </div>
    </section>
  );
}

export function ShinhanGuestEmpathy() {
  return (
    <section className={styles.empathy} aria-labelledby="shinhan-guest-empathy-heading">
      <div className={`${styles.container} ${styles.empathyContent}`}>
        <header className={styles.empathyHeading}>
          <p className={styles.topic}>
            <Image src="/images/shinhan/guest/empathy-dot.svg" alt="" width={6} height={6} />
            대학생의 집 고민
          </p>
          <h2 id="shinhan-guest-empathy-heading">
            통학은 멀고,
            <br />
            기숙사는 불편하고,
            <br />
            <em>원룸은 부담스럽다면.</em>
          </h2>
          <p className={styles.empathyDescription}>
            학교 근처에서, 나만의 공간을
            <br />
            찾고 싶은 마음을 알아요.
          </p>
        </header>
        <ul className={styles.conversations}>
          {conversations.map((item, index) => (
            <li
              key={item.image}
              className={`${styles.conversation} ${index === 1 ? styles.reverse : ""}`}
            >
              <Image
                className={styles.avatar}
                src={`/images/shinhan/guest/empathy-${item.image}.png`}
                alt=""
                width={88}
                height={88}
                sizes="(max-width: 767px) 48px, 88px"
              />
              <div className={styles.bubble}>
                <p className={styles.badge}>{item.topic}</p>
                <h3>{item.title}</h3>
                <p className={styles.dialogue}>{item.body}</p>
                <Image
                  className={styles.tail}
                  src={`/images/shinhan/guest/empathy-tail${index === 1 ? "-blue" : ""}.svg`}
                  alt=""
                  width={14}
                  height={24}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

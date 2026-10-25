import Image from "next/image";

import { ShinhanEntryNotice, ShinhanHostFormButton } from "@/features/shinhan-intake";

import styles from "./host-introduction.module.css";

const benefits = [
  {
    image: "income",
    title: "빈방으로 생활소득",
    body: "사용하지 않던 방을 청년의 주거 공간으로 활용해, 생활비에 보탬이 되는 월세를 받아보세요.",
  },
  {
    image: "match",
    title: "서로 맞는 청년과 함께",
    body: "청년의 신원과 생활습관을 미리 확인하고, 입주 전 함께 지킬 생활 규칙을 정합니다.",
  },
  {
    image: "life",
    title: "식사·빨래 부담 없이",
    body: "청년의 식사나 빨래를 챙겨줄 필요 없이, 각자의 생활을 존중하며 함께 지냅니다.",
  },
  {
    image: "care",
    title: "거주 중에도 함께 관리",
    body: "함께 살며 불편이나 갈등이 생기면, 홈투게더가 중간에서 함께 조율합니다.",
  },
];

export function ShinhanHostHero() {
  return (
    <section id="shinhan-host-hero" className={styles.hero} aria-labelledby="shinhan-host-heading">
      <div className={styles.container}>
        <div className={styles.partnership} aria-label="신한 슈퍼SOL × 홈투게더">
          <span className={styles.sol}>
            <Image src="/images/shinhan/super-sol.png" alt="" width={28} height={28} />
            신한 슈퍼SOL
          </span>
          <span className={styles.cross} aria-hidden="true">
            ×
          </span>
          <Image
            src="/images/shinhan/home-together-footer.svg"
            alt="Home Together"
            width={155}
            height={28}
          />
        </div>
        <div className={styles.heroContent}>
          <div className={styles.heroCopy}>
            <h1 id="shinhan-host-heading">
              비어 있는 <strong>방 한 칸,</strong>
              <br />
              <strong>검증된 청년</strong>으로 안심하고,
              <br />
              <strong>매달 생활비</strong>로 여유롭게.
            </h1>
            <p className={styles.heroDescription}>
              방 준비부터 청년 입주, 거주 중 관리까지
              <br />
              홈투게더가 함께합니다.
            </p>
            <div className={styles.registration}>
              <ShinhanHostFormButton
                flow="registration"
                size="pill"
                shape="rect"
                className={styles.registrationButton}
                aria-describedby="shinhan-registration-status"
                rightIcon={
                  <Image
                    src="/images/shinhan/host/chevron-right.svg"
                    width={8}
                    height={12}
                    alt=""
                  />
                }
              >
                홈투게더로 방 등록하기
              </ShinhanHostFormButton>
              <p id="shinhan-registration-status" className={styles.preparing}>
                <ShinhanEntryNotice>
                  집 위치와 연락처를 입력해 방 등록을 신청해 보세요.
                </ShinhanEntryNotice>
              </p>
            </div>
          </div>
          <Image
            src="/images/host-landing/hero.png"
            alt="살던 집의 빈방을 월세 생활비로 활용하는 모습을 표현한 평면도 일러스트"
            width={837}
            height={730}
            sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1279px) 48vw, 591px"
            loading="eager"
            className={styles.heroArt}
          />
        </div>
      </div>
    </section>
  );
}

export function ShinhanHostBenefits() {
  return (
    <>
      <section className={styles.empathy} aria-label="집주인의 고민과 빈방 활용">
        <div className={`${styles.container} ${styles.empathyCard}`}>
          <div className={styles.empathyScene}>
            <div className={`${styles.bubble} ${styles.firstBubble}`}>
              <p>
                집을 팔기엔 아깝고,
                <br />
                이사하고 싶지도 않아요.
              </p>
              <Image src="/images/shinhan/host/speech-tail.svg" width={24} height={16} alt="" />
            </div>
            <Image
              className={styles.house}
              src="/images/shinhan/host/house.png"
              width={384}
              height={384}
              alt="익숙한 우리 집을 표현한 파란 지붕 집"
              sizes="(max-width: 767px) 280px, 384px"
            />
            <div className={`${styles.bubble} ${styles.secondBubble}`}>
              <p>
                집은 한 채 있지만,
                <br />
                생활비는 더 필요해요.
              </p>
              <Image src="/images/shinhan/host/speech-tail.svg" width={24} height={16} alt="" />
            </div>
          </div>
          <div className={styles.empathyCaption}>
            <p>지금 살고 있는 집에서</p>
            <h2>비어 있는 방을 활용해보세요.</h2>
          </div>
        </div>
      </section>
      <section className={styles.benefits} aria-labelledby="shinhan-host-goal">
        <div className={styles.container}>
          <p className={styles.eyebrow}>홈투게더의 목표</p>
          <div className={styles.goal}>
            <h2 id="shinhan-host-goal">
              우리집 <strong>남는 방을</strong>
              <br />
              홈투게더와 함께 <strong>안전하게</strong>
              <br />
              검증된 <strong>대학생에게 임대</strong>
            </h2>
            <Image
              src="/images/shinhan/host/goal.svg"
              width={403}
              height={124}
              alt="집주인과 대학생을 연결하는 홈투게더"
              className={styles.goalArt}
            />
          </div>
          <div className={styles.benefitGrid}>
            {benefits.map((benefit) => (
              <article className={styles.benefitCard} key={benefit.image}>
                <Image
                  src={`/images/shinhan/host/benefit-${benefit.image}.svg`}
                  width={81}
                  height={81}
                  alt=""
                  className={styles.benefitIcon}
                />
                <div>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className={styles.income} aria-labelledby="shinhan-host-income">
        <div className={`${styles.container} ${styles.incomeContent}`}>
          <Image
            src="/images/shinhan/host/room-income.png"
            width={440}
            height={440}
            alt="빈방의 침대와 책상 옆에 월세 수익을 표현한 동전"
            className={styles.incomeArt}
            sizes="(max-width: 767px) calc(100vw - 40px), 440px"
          />
          <div className={styles.incomeCopy}>
            <h2 id="shinhan-host-income">
              살던 집에서 그대로,
              <br />
              비어 있던 방으로 <span>매달 월세 벌기!</span>
            </h2>
            <p>
              익숙한 집과 동네에서 계속 생활하면서,
              <br />
              사용하지 않던 방을 빌려주고 월세를 받는 생활.
            </p>
            <div className={styles.supportNote}>
              <p>처음 해보는 방 임대도</p>
              <strong>혼자 준비하고 관리하지 않아도 됩니다.</strong>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export function ShinhanHostEstimateBand() {
  return (
    <section className={styles.estimateBand} aria-labelledby="shinhan-estimate-heading">
      <div className={styles.container}>
        <p>홈투게더에 방을 등록하면</p>
        <h2 id="shinhan-estimate-heading">
          <span>우리 집 빈방,</span>
          <br />
          얼마 받을 수 있을까요?
        </h2>
        <ShinhanHostFormButton
          data-shinhan-estimate-cta
          flow="estimate"
          variant="stroke"
          size="pill"
          className={styles.estimateButton}
          aria-describedby="shinhan-estimate-status"
        >
          빈방 예상 월세 알아보기
        </ShinhanHostFormButton>
        <p id="shinhan-estimate-status" className={styles.preparing}>
          <ShinhanEntryNotice>
            우리 집 조건을 입력하고 예상 월세를 확인해 보세요.
          </ShinhanEntryNotice>
        </p>
      </div>
    </section>
  );
}

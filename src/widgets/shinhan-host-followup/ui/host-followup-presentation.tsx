import Image from "next/image";
import type { ReactNode } from "react";

import styles from "./host-followup-presentation.module.css";

interface HostResultFrameProps {
  income: ReactNode;
  children: ReactNode;
}

interface HostIntroductionFrameProps {
  children: ReactNode;
}

export function HostResultFrame({ income, children }: HostResultFrameProps) {
  return (
    <div className={styles.frame}>
      <header className={styles.resultHeading}>
        <h1>우리 집 빈방으로 만드는, 1년의 여유</h1>
        <p>예상 월세를 1년으로 계산해 봤어요.</p>
      </header>
      <div className={styles.incomeCard}>
        <div className={styles.incomeContent}>
          {income}
          <p className={styles.incomeDescription}>
            <span>12개월 거주 기준이에요. 실제 수익은 계약 기간과</span>
            <span>방 상태, 제공 조건에 따라 달라질 수 있어요.</span>
          </p>
        </div>
        <Image
          src="/images/shinhan/host/room-income.png"
          width={280}
          height={280}
          alt="빈방과 월세 수익을 표현한 그림"
          className={styles.roomImage}
        />
      </div>
      {children}
      <p className={styles.disclaimer}>
        ※ 참고용 예상 금액으로, 실제 월세는 주택 상태와 계약 조건 등에 따라 달라질 수 있으며
        임대수익을 보장하지 않습니다.
      </p>
    </div>
  );
}

export function HostIntroductionFrame({ children }: HostIntroductionFrameProps) {
  return (
    <div className={styles.frame}>
      <div className={styles.introductionLayout}>
        <header className={styles.introductionHeading}>
          <p className={styles.eyebrow}>우리 집에 맞는 청년이 있을 때만</p>
          <h1>
            <span>지금은 청년 소개서만</span>
            <span>받아보세요.</span>
          </h1>
          <div className={styles.introductionDescription}>
            <p>
              <span>우리 집 조건에 맞는 청년이 있으면,</span>
              <span>홈투게더가 소개서를 정리해 보내드릴게요.</span>
            </p>
            <p>
              <span>마음에 드는 청년이 있을 때,</span>
              <span>만나볼지 생각하셔도 괜찮아요.</span>
            </p>
          </div>
        </header>
        <section
          className={styles.introductionCard}
          aria-labelledby="host-introduction-card-heading"
        >
          <div className={styles.cardHeading}>
            <div className={styles.characterBackground}>
              <Image
                src="/images/shinhan/guest/budget-character.png"
                width={68}
                height={68}
                alt=""
                className={styles.character}
              />
            </div>
            <div className={styles.cardTitle}>
              <h2 id="host-introduction-card-heading">이런 소개서를 보내드려요</h2>
              <p>궁금하실 내용을 한눈에 담아드려요.</p>
            </div>
          </div>
          <ol className={styles.informationList}>
            <li>
              <span className={styles.itemNumber} aria-hidden="true">
                01
              </span>
              <div>
                <h3>어떤 청년인지</h3>
                <p>청년의 자기소개와 인사를 담아드려요.</p>
              </div>
            </li>
            <li>
              <span className={styles.itemNumber} aria-hidden="true">
                02
              </span>
              <div>
                <h3>언제, 얼마나 지내고 싶은지</h3>
                <p>희망 입주 시기와 거주 기간을 정리해드려요.</p>
              </div>
            </li>
            <li>
              <span className={styles.itemNumber} aria-hidden="true">
                03
              </span>
              <div>
                <h3>평소 어떻게 생활하는지</h3>
                <p>생활 습관과 일상을 보기 쉽게 담아드려요.</p>
              </div>
            </li>
          </ol>
        </section>
      </div>
      <aside className={styles.reassurance}>
        <span className={styles.reassuranceCheck} aria-hidden="true">
          ✓
        </span>
        <p>소개서만 받아보고, 더 진행하지 않으셔도 괜찮아요.</p>
      </aside>
      {children}
    </div>
  );
}

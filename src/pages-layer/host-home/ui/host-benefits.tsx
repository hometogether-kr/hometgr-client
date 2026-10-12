import Image from "next/image";

import { hostContainer } from "./section-heading";

import styles from "./host-layout.module.css";

const benefits = [
  {
    image: "income",
    title: "빈방으로 생활소득",
    body: "사용하지 않던 방을 청년의 주거 공간으로 활용해,\n생활비에 보탬이 되는 월세를 받아보세요.",
  },
  {
    image: "match",
    title: "서로 맞는 청년과 함께",
    body: "청년의 신원과 생활습관을 미리 확인하고,\n입주 전 함께 지킬 생활 규칙을 정합니다.",
  },
  {
    image: "life",
    title: "식사·빨래 부담 없이",
    body: "청년의 식사나 빨래를 챙겨줄 필요 없이,\n각자의 생활을 존중하며 함께 지냅니다.",
  },
  {
    image: "care",
    title: "거주 중에도 함께 관리",
    body: "함께 살며 불편이나 갈등이 생기면,\n홈투게더가 중간에서 함께 조율합니다.",
  },
];
export function HostBenefits() {
  return (
    <section className={styles.benefits}>
      <div className={hostContainer}>
        <p className={styles.goalLabel}>홈투게더의 목표</p>
        <div className={styles.goal}>
          <h2>
            우리집 <strong>남는 방을</strong>
            <br />
            홈투게더와 함께 <strong>안전하게</strong>
            <br />
            검증된 <strong>대학생에게 임대</strong>
          </h2>
          <Image src="/images/host-landing/goal.png" alt="" width={404} height={124} />
        </div>
        <div className={styles.benefitGrid}>
          {benefits.map((item) => (
            <article key={item.image} className={styles.benefitCard}>
              <Image
                src={`/images/host-landing/benefit-${item.image}.png`}
                alt=""
                width={81}
                height={81}
              />
              <div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

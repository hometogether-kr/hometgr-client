import Image from "next/image";
import { Fragment } from "react";

import { hostContainer, SectionHeading } from "./section-heading";

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
const steps = [
  { title: "방 등록", body: "방 사진과 기본 정보만 올려주세요.\n어려우면 전화로 도와드립니다." },
  {
    title: "홈투게더가 학생을 찾아 확인합니다",
    body: "검증한 학생만 연결하고,\n방문 일정까지 조율합니다.",
  },
  { title: "계약하고 시작", body: "계약서 작성부터 입주까지\n함께 진행합니다." },
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
export function HostSteps() {
  return (
    <section className={styles.steps}>
      <div className={hostContainer}>
        <SectionHeading label="진행 방법">방 등록부터 입주까지, 세 단계면 됩니다</SectionHeading>
        <ol className={styles.stepList}>
          {steps.map((step, index) => (
            <Fragment key={step.title}>
              <li className={styles.stepCard}>
                <p className={styles.stepNumber}>0{index + 1}</p>
                <h3>{step.title}</h3>
                <p className={styles.stepBody}>{step.body}</p>
                {index === 0 && (
                  <div className={styles.stepNote}>
                    <Image src="/images/host-landing/step-note.svg" alt="" fill />
                    <p>
                      방 등록만으로 입주가
                      <br />
                      확정되지 않습니다.
                    </p>
                  </div>
                )}
              </li>
              {index < 2 && (
                <li className={styles.stepArrow} aria-hidden="true">
                  <Image src="/images/host-landing/step-arrow.svg" alt="" width={24} height={24} />
                </li>
              )}
            </Fragment>
          ))}
        </ol>
      </div>
    </section>
  );
}
